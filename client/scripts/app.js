// YOUR CODE HERE:

var getMessages = function() {

  var latestMessage ={};//= {'createdAt' : '2014-12-30T03:20:54.343Z'};
  var locked = false;


  return function() {
    var body = {
      order : '-createdAt',
      limit : 100,
      where: {
        'createdAt' : {'$gt' : latestMessage.createdAt},
        'text' : {'$gt' : ''},
      }
    };
    if(typeof window.options.roomname !== 'undefined') {
      body.where.roomname = window.options.roomname;
    }

    if (!locked) {
      $.ajax({
        // always use this url
        url: 'https://api.parse.com/1/classes/chatterbox',
        type: 'GET',
        contentType: 'application/json',
        success: function(data) {
          displayMessages(data.results);
          latestMessage = data.results[0] || latestMessage;
          if (latestMessage === undefined) {
            debugger;
          }
          locked = false;
          // populateRooms(data.results);
        },
        data: body,
        error: function (data) {
          // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to receive message');
        }
      });
      locked = true;
    }
  }
}();

var createMessage = function(message) {
  var msgElement = $('<div>').addClass('chat'),
      usrElement = $('<span>').addClass('username').html(filterXSS(message.username || '')),
      txtElement = $('<span>').addClass('text').html(filterXSS(message.text || '')),
      roomElement = $('<span>').addClass('room').append(
                      $('<a>').attr('href', '#')
                              .html(filterXSS(message.roomname || ''))
                    ),
      timeElement = $('<span>').addClass('time').html(message.createdAt);

  roomElement.on('click', function (event) {
    event.preventDefault();
    window.options.roomname = event.target.innerText;
    window.location.search = queryString.stringify(window.options);
  });

  updateRooms(message.roomname);

  return msgElement.append(usrElement, txtElement, roomElement, timeElement);
};

var displayMessages = function(messages) {
  for(var i = messages.length - 1; i >= 0; i--) {
    var newMessage = createMessage(messages[i]);
    $('#main .messages').prepend(newMessage);
  }
};

var sendMessage = function() {

  var message = {
    'username': filterXSS(window.options.username),
    'text': filterXSS($('#inputMessage').val()),
    'roomname': window.options.roomname
  };

  $.ajax({
    // always use this url
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(message),
    success: function (data) {
      getMessages();
      return false;
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });

  $('#inputMessage').val('');

  return false;
};

var updateRooms = function () {

  var availableRooms = {};

  return function (room) {
    availableRooms[room] = room;
  };

}();

$(document).ready(function() {
  'use strict'
  window.options = queryString.parse(window.location.search);

  console.log(window.options);
  getMessages();

  setInterval(getMessages, 5000);
});






