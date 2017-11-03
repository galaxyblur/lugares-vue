import keenClient from '../keen';

export const recordEvent = (name, evt) => {
  keenClient.recordEvent(name, evt);
};

export const recordPageview = (routeTo, routeFrom) => {
  keenClient.recordEvent('pageview', {
    routeTo,
    routeFrom,
  });
};

export default {
  install(Vue) {
    Vue.prototype.$recordEvent = recordEvent; // eslint-disable-line no-param-reassign
    Vue.prototype.$recordPageview = recordPageview; // eslint-disable-line no-param-reassign
  },
};
