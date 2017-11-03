import Keen from 'keen-tracking';

const client = new Keen({
  projectId: '59dab7acc9e77c0001155dfa',
  writeKey: 'CF0F3B59253DCF2DA94EAFD9A9142039AF86B36B306EBD2DD97E45CE0873CC052C72F295631E4D0B93DEBAC336B3A80D8C10DA1275FC008046D9E568451174EDB2BE4FC9D85DD0EF1A77A579716D07B16012022D2D69213438CCAA10137FE074',
});

const helpers = Keen.helpers;
const utils = Keen.utils;

const sessionCookie = utils.cookie('rename-this-example-cookie');

if (!sessionCookie.get('guest_id')) {
  sessionCookie.set('guest_id', helpers.getUniqueId());
}

client.extendEvents(() => ({
  geo: {
    info: { /* Enriched */ },
    ip_address: '${keen.ip}', // eslint-disable-line no-template-curly-in-string
  },
  page: {
    info: { /* Enriched */ },
    title: document.title,
    url: document.location.href,
  },
  referrer: {
    info: { /* Enriched */ },
    url: document.referrer,
  },
  tech: {
    browser: helpers.getBrowserProfile(),
    info: { /* Enriched */ },
    user_agent: '${keen.user_agent}', // eslint-disable-line no-template-curly-in-string
  },
  time: helpers.getDatetimeIndex(),
  visitor: {
    guest_id: sessionCookie.get('guest_id'),
    /* Include additional visitor info here */
  },
  keen: {
    addons: [
      {
        name: 'keen:ip_to_geo',
        input: {
          ip: 'geo.ip_address',
        },
        output: 'geo.info',
      },
      {
        name: 'keen:ua_parser',
        input: {
          ua_string: 'tech.user_agent',
        },
        output: 'tech.info',
      },
      {
        name: 'keen:url_parser',
        input: {
          url: 'page.url',
        },
        output: 'page.info',
      },
      {
        name: 'keen:referrer_parser',
        input: {
          referrer_url: 'referrer.url',
          page_url: 'page.url',
        },
        output: 'referrer.info',
      },
    ],
  },
}));

export default client;
