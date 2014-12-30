// YOUR CODE HERE:

var getMessages = function() {
  $.ajax({
    // always use this url
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    contentType: 'application/json',
    success: function(data) {
      displayMessages(data.results)
    },
    data: {
      order : '-createdAt',
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to receive message');
    }
  });
};

var createMessage = function(message) {
  var msgElement = $('<div>').addClass('chat'),
      usrElement = $('<span>').addClass('username').html(filterXSS(message.username || '')),
      txtElement = $('<span>').addClass('text').html(filterXSS(message.text || '')),
      timeElement = $('<span>').addClass('time').html(message.createdAt);

  return msgElement.append(usrElement, txtElement, timeElement);
};

var displayMessages = function(messages) {
  $('#main .messages').html('');
  for(var i = 0; i < messages.length; i++) {
    var newMessage = createMessage(messages[i]);
    $('#main .messages').append(newMessage);
  }
};

var sendMessage = function() {
  $.ajax({
    // always use this url
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    contentType: 'application/json',
    data: {
      order : '-createdAt',
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to receive message');
    }
  });

  return false;
};

$(document).ready(function() {
  'use strict'
  var params = window.location.search.slice(1).split('&');
  window.options = {};

  for(var i = 0; i < params.length; i++) {
    var pair = params[i].split('=');
    window.options[pair[0]] = pair[1];
  }

  console.log(window.options);
  getMessages();

  setInterval(getMessages, 5000);
});




