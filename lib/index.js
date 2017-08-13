import {
  wrap,
} from 'co';
import request from 'request';
import Debug from 'debug';


export default class AnyleadsApi {
  constructor(apiKey) {
    if (!(this instanceof AnyleadsApi)) {
      return new AnyleadsApi(apiKey);
    }

    this.apiKey = apiKey;

    if (!this.apiKey) {
      throw new Error('Missing API key');
    }

    this.minimumDeliverableScore = 0.70;
    this.debug = Debug('anyleadsService');
    return this;
  }

  getPattern(domain) {
    this.debug('#getPattern get pattern of domain\'s email', { domain });

    if (!domain) {
      throw Error('Domain is required');
    }

    const url = 'https://api.anyleads.com/v1/get-pattern/?';
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        url,
        qs: {
          domain,
          api_key: this.apiKey,
        },
        json: true,
      }, (err, response, body) => {
        if (err) {
          reject(err);
          return;
        }

        if (!body || !body.event === 'success') {
          resolve(false);
          return;
        }

        this.debug('#getPattern result from anyleads API', { domain, pattern: body.pattern });
        resolve(body.pattern);
      });
    });
  }

  verifyEmail(email) {
    this.debug('#verifyEmail verify email', { email });

    if (!email) {
      throw Error('Email is required');
    }

    const url = 'https://api.anyleads.com/v1/verify-email/';
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        url,
        qs: {
          email,
          api_key: this.apiKey,
        },
        json: true,
      }, (err, response, body) => {
        if (err) {
          reject(err);
          return;
        }

        if (!body) {
          resolve(false);
          return;
        }

        this.debug('#verifyEmail result from anyleads API', { email, result: body });

        // mx_found and smtp_check is to be sure an email can be sent there
        // When catch_all is valid, we cannot be sure of deliverability
        const deliverable = body.mx_found &&
                            body.smtp_check &&
                            !body.catch_all &&
                            body.score > this.minimumDeliverableScore;

        if (!deliverable) {
          this.debug('#verifyEmail email not deliverable', { email });
        } else {
          this.debug('#verifyEmail email deliverable', { email });
        }

        resolve(deliverable);
      });
    });
  }

  searchDomainEmails(domain) {
    this.debug('#searchDomainEmails search domain emails', { domain });
    const url = 'https://api.anyleads.com/v1/domain/';
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        url,
        qs: {
          // TODO: Check what is this parameter o_o
          page: 0,
          domain,
          api_key: this.apiKey,
        },
        json: true,
      }, (err, response, body) => {
        if (err) {
          reject(err);
          return;
        }

        if (body.event !== 'success' || !body.data) {
          resolve([]);
          return;
        }
        this.debug('#searchDomainEmails result from API', { domain, result: body.data });
        resolve(body.data);
      });
    });
  }

  getPersonalEmail(domain, identity) {
    this.debug('#getPersonalEmail get personal email', { domain, identity });
    const url = 'https://api.anyleads.com/v1/permutation/';
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        url,
        qs: {
          domain,
          first_name: identity.firstName,
          last_name: identity.lastName,
          api_key: this.apiKey,
        },
        json: true,
      }, wrap(function* (err, response, body) {
        if (err) {
          reject(err);
          return;
        }

        if (!(body && body.email)) {
          resolve(null);
          return;
        }

        this.debug('#getPersonalEmail result from API', { domain, identity, result: body });

        const email = body.email;
        if (!email) {
          this.debug('#getPersonalEmail no email from API', { domain, identity });
          resolve(null);
          return;
        }

        const isDeliverable = yield this.verifyEmail(email);

        if (!isDeliverable) {
          this.debug('#getPersonalEmail email is not deliverable', { domain, identity, email });
          resolve(null);
          return;
        }

        this.debug('#getPersonalEmail email found', { domain, identity, email });
        resolve(email);
      }));
    });
  }
}
