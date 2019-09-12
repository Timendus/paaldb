const xss = require("xss");

// Whitelist of the tags that we DO allow to stay
const xssOptions = {
  whiteList: {
    h1: [],
    h2: [],
    h3: [],
    p: [],
    a: ["href", "title"],
    b: [],
    i: [],
    u: [],
    br: [],
    strong: [],
    em: [],
    img: ["src", "title", "alt"]
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script"],
  allowCommentTag: false
}

// Add target="_blank" to all links as a secondary step
const targetOptions = {
  onTag: (tag, html, options) => {
    if ( tag != 'a' || options.isClosing ) return;
    return html.substr(0, html.length - 1) + ' target="_blank">';
  }
}

module.exports.parse = (html) => {
  if ( !html ) return null;
  html = html.replace(new RegExp(`(\n|\t|\r)`, 'g'), '');
  html = xss(html, xssOptions);
  return xss(html, targetOptions);
}
