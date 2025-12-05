const authStrategy = require('../../../../../config/auth/strategy');

const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: authStrategy.JwtAuthStrategyName,
    },
  },
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postCommentHandler,
    options: {
      auth: authStrategy.JwtAuthStrategyName,
    },
  },
]);

module.exports = routes;
