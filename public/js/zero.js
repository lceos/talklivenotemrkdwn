$(function() {
    var userId = $('#userId').val();
    var socket = io();
    var haystack = [];
    var sentence = '';
    var newEntry;

    function limitHaystackSize() {
        if (haystack.length > 3) {
            $('#haystack').find('blockquote').last().unbind('click').remove();
        }
    }

    function genButtons(id) {
        var _buttons = '<div class="text-right myButtons">';
        _buttons += `<button id="haystackRemoveButton_${id}" type="button" class="btn btn-danger btn-xs" value="${id}"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>`;
        _buttons += `<button id="haystackButton_${id}" type="button" class="btn btn-success btn-xs" value="${id}"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> send</button>`;
        _buttons += '</div>';

        $('#haystack').on("click", `#haystackButton_${id}`, function() { //delegated event
            socket.emit('validatedSentence', { q: haystack[id], userId });
            $(this).unbind('click').parent().parent().hide();
            $('#m').focus();
        });

        $('#haystack').on("click", `#haystackRemoveButton_${id}`, function() { //delegate event
            var $this = $(this);
            $this.unbind('click').parent().parent().hide();
        });

        return $(_buttons);
    }

    function addToHaystack(m) {
        haystack.push(m);
        var blockquoteClass = ((haystack.length - 1) % 2) ? 'blockquote-reverse' : '';
        newEntry = $('<p id="sentenceEntry_' + (haystack.length - 1) + '"></p>').text(m);
        $('#haystack')
            .prepend($(`<blockquote class="${blockquoteClass}">`)
                .append(newEntry)
                .append(genButtons(haystack.length - 1))
            );
        $('#m').val('');
        limitHaystackSize()
    }

    function lookForChange(m, force) {
        if (m !== sentence && m.length > 0) {
            sentence = m;
            if (m.indexOf('.') >= 0) addToHaystack(m);
        } else if (force === true && m.length > 0) {
            addToHaystack(m);
        }
    }

    //  function writeText() {
    //     var $txt = jQuery("#code");
    //     var caretPos = $txt[0].selectionStart;
    //     var textAreaTxt = $txt.val();
    //     var txtToAdd = "stuff";
    //     $txt.val(textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos) );
    // }

    //events
    $('#speechForm').submit(function(e) {
        lookForChange($('#m').val(), true);
        $('#m').focus();
        e.preventDefault();
        return false;
    });

    if ($('#m').length != 0) {
        setInterval(function() {
            lookForChange($('#m').val(), false);
        }, 500);
    }

    //output
    if ($('#visualize').length != 0 || $('#out').length !== 0) {
        socket.on('connect', function() {
            // Connected, let's sign-up for to receive messages for this room
            console.log('sign-up to user room', userId)
            socket.emit('room', userId);
        });
        socket.on('writeToOutput', function(data) {
            $('#visualize').append($('<li>').text(data.q));
            appendToEditorDoc(data.q);
        });
    }
});