const authStrategy = require('../../../../../config/auth/strategy');

const routes = (handler) => ([
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: handler.putLikeHandler,
    options: {
      auth: authStrategy.JwtAuthStrategyName,
    },
  },
]);

module.exports = routes;
