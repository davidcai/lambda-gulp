var LegalDocsResolver = require('./legal-docs-resolver');


module.exports.handler = function(event, context) {
  var legalDocsResolver = new LegalDocsResolver();

  legalDocsResolver.getS3Files().then(function(data) {
    context.done(null, data);
  }).catch(function(err) {
    context.done(null, err);
  });
};
