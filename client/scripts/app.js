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
  var msgElement = $('<div>').addClass('chat');
  var usrElement = $('<span>').addClass('username').html(filterXSS(message.username || '').slice(0,30));
  var txtElement = $('<span>').addClass('text').html(filterXSS(message.text || ''));
  var timeElement = $('<span>').addClass('time').html(moment(message.createdAt).format('MMM DD YYYY,h:mm:ss a'));

  if(!window.options.roomname) {
    var roomElement = $('<span>').addClass('room').append(
                     $('<a>').attr('href', '#')
                             .html(filterXSS(message.roomname || '')));
    roomElement.on('click', function (event) {
      event.preventDefault();
      window.options.roomname = event.target.innerText;
      window.location.search = queryString.stringify(window.options);
    });
  }




  return msgElement.append(usrElement, txtElement, timeElement, (roomElement ? roomElement : ''));
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
    availableRooms[window.options.roomname] = 0;

    $.ajax({
      // always use this url
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      contentType: 'application/json',
      data: {
        order : '-createdAt',
        limit : 500,
        keys : 'roomname'
      },
      success: function (data) {
        var results = data.results;
        for (var i = 0; i < results.length; i++) {
          availableRooms[results[i].roomname] = availableRooms[results[i].roomname] + 1 || 1;
        }
        displayRooms(availableRooms)
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message');
      }
    });

    availableRooms[room] = room;
  };

  function displayRooms (availableRooms) {
    var roomNames = Object.keys(availableRooms);
    for (var i = 0; i < roomNames.length; i++) {
      var roomName = roomNames[i];
      var roomElement = $('<div>').addClass('room')
                          .append($('<a>')
                            .attr('data-name', filterXSS(roomName))
                            .attr('href', '#')
                            .html(filterXSS(roomName).slice(0,30)))
                          .append($('<span>').addClass('messageCount')
                            .html(availableRooms[roomNames[i]])
                          );
      roomElement.children('a').on('click', function (event) {
        event.preventDefault();
        console.log(event);
        window.options.roomname = event.target.dataset.name;
        window.location.search = queryString.stringify(window.options);
      });
      $('.roomsList').append(roomElement);
    }
  }

}();

var enterRoom = function() {
  window.options.roomname = $('#inputRoom').val();
  window.location.search = queryString.stringify(window.options);
  return false;
}

$(document).ready(function() {
  'use strict'
  window.options = queryString.parse(window.location.search);

  console.log(window.options);
  getMessages();

  updateRooms();
  setInterval(getMessages, 5000);
});






