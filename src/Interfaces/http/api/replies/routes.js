const authStrategy = require('../../../../../config/auth/strategy');

const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: handler.postReplyHandler,
    options: {
      auth: authStrategy.JwtAuthStrategyName,
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: handler.deleteReplyByIdHandler,
    options: {
      auth: authStrategy.JwtAuthStrategyName,
    },
  },
]);

module.exports = routes;
