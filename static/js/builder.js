const csrfToken = getCookie('csrftoken');
let audio = '';
let audioFile;

$(document).ready(function () {
    sortQuestions();
    createQuestionGroup();
    createQuestion();
    chooseImage();

    deleteImage();
    addMatchingOption();
    addMultipleOption();

});

deleteAudio();
questionAudioListener();
showQuestions();
deleteQuestionAndQuestionGroup();


// TODO
function createQuestion() {
    $("#createQuestionForm").submit(function (event) {

        var questionTrueId = $("#questionTrueId").is(":checked");
        var questionFalseId = $("#questionFalseId").is(":checked");

        var trueFalseChoicer = questionTrueFalseChoicer(questionTrueId, questionFalseId)
        var formData = {
            'csrfmiddlewaretoken': csrfToken,
            'description': $("#questionTextarea").val(),
            'image': document.getElementById("showImageId").src,
            'is_true': trueFalseChoicer,
            'score': 5,
            'question_group': $(".question-group-list li:first").attr("id"),
        }

        var question_form = new FormData();
        // question_form.append("file" ,audioFile);

        question_form.append("csrfmiddlewaretoken", csrfToken);

        question_form.append("description", $("#questionTextarea").val());
        question_form.append("image", document.getElementById("showImageId").src);
        question_form.append("is_true", trueFalseChoicer);
        question_form.append("score", 5);
        question_form.append("question_group", $(".question-group-list li:first").attr("id"));

        //


        var createQuestionForm = $("#createQuestionForm");


        $.ajax({
            url: $(this).data("url"),
            type: 'post',
            processData: false,
            contentType: false,
            // mimeType: "multipart/form-data",
            data: formData,

            success: function (response) {
                console.log(response.new_question_group.id);
                console.log(response.new_question.id);

                var question_group_list_id = $("#question-group-list-id");
                question_group_list_id.append('<li class="question-group" data-id="' +
                    response.new_question_group.id + '"><div class="d-flex tag-btn"><a class="nest">' +
                    response.new_question_group.name + '</a><button type="button" class="close float-right" name="qu" data-id="' +
                    response.new_question_group.id +
                    '"><span aria-hidden="true">&times;</span></button></div><ul class="question-list mr-2 inner "  data-id="' +
                    response.new_question_group.id + '">' + '<li class="question"></li></ul></li>');
                console.log('444')
            },

        });
        $("#createQuestionGroupForm")[0].reset();

    })
}


function createQuestionGroup() {
    $("#createQuestionGroupButton").click(function () {
        var createQuestionGroupForm = $("#createQuestionGroupForm");
        var serializedData = createQuestionGroupForm.serialize();

        $.ajax({
            url: this.url,
            data: serializedData,
            type: 'post',
            success: function (response) {

                var question_group_list_id = $("#question-group-list-id");
                question_group_list_id.append('<li class="question-group" data-id="' +
                    response.new_question_group + '"><div class="d-flex tag-btn"><a class="nest">' +
                    response.new_question_group_name + '</a><button type="button" class="close float-right" name="question_group" data-id="' +
                    response.new_question_group +
                    '"><span aria-hidden="true">&times;</span></button></div><ul class="question-list mr-2 inner "  data-id="' +
                    response.new_question_group + '">' + '<li class="question"></li></ul></li>');
            },

        });
        createQuestionGroupForm[0].reset();

    })
}

//TODO
function sortQuestions() {
    $('.sortable').nestedSortable({
        forcePlaceholderSize: true,
        items: 'li',
        handle: 'a',
        placeholder: 'menu-highlight',
        listType: 'ul',
        maxLevels: 3,
        opacity: .6,
        stop: function (event, ui) {

            var qg_list = ui.item.parent().attr('class').indexOf("question-group-list") >= 0;
            var q_list = ui.item.parent().attr('class').indexOf("question-list") >= 0;
            var qg = ui.item.attr('class').indexOf("question-group") >= 0;

            var q = ui.item.attr('class').indexOf("question") >= 0;

            console.log(qg);
            console.log();

            if (qg_list         // if it's a group...
                && !q_list && !qg)// but moved within another group
            {
                $(this).sortable('cancel');           // cancel the sorting!
            }
            if (!qg_list         // if it's a group...
                && q_list && qg)// but moved within another group
            {
                $(this).sortable('cancel');           // cancel the sorting!
            }
        },
        update: function (e, ui) {
            var qg_id = ui.item.parent().attr('data-id');
            var q_id = ui.item.attr('data-id');
            if (qg_id && q_id) {
                $.ajax({
                    url: '/builder/' + qg_id + '/sort_questions/',
                    type: 'post',
                    data: {csrfmiddlewaretoken: csrfToken, question_group_id: qg_id, question_id: q_id},
                    success: function (request) {
                        $('.sortable');
                    }
                })
            }
        }
    });

}

function chooseImage() {
    $('#questionImageId').change(function () {
        const file = this.files[0];
        const invalidImageAlert = $('#invalidImageAlert');
        if (file) {
            // Check if the selected file is an image
            if (isValidImageType(file.type)) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    $('#imageHandler').removeAttr('hidden');
                    $('#showImageId').attr('src', event.target.result);
                    invalidImageAlert.hide(); // Hide the alert if it was previously shown
                };
                reader.onerror = function () {
                    // Handle errors, e.g., display an error message
                    console.error('Error reading the image file.');
                };
                reader.readAsDataURL(file);
            } else {
                // Display the Bootstrap alert for invalid image file
                invalidImageAlert.show();
                // Hide the image if it was previously displayed
                $('#imageHandler').attr('hidden', 'hidden');
                setTimeout(function () {
                    invalidImageAlert.hide();
                }, 3000);
            }
        } else {
            // Handle the case where no file is selected
            console.error('No image file selected.');
        }
    });
}

// Function to check if the file type is an image
function isValidImageType(fileType) {
    return /^image\//.test(fileType);
}


$(document).on('click', 'button.remove-option', function (event) {
    $(this).closest('tr.q-option').remove();
})

function deleteQuestionAndQuestionGroup() {
    $(document).on('click', 'button.close', function (event) {
        event.stopPropagation();
        var dateId = $(this).data('id');
        var del_el_name = $(this).attr('name');

        // Get the CSRF token from the cookie

        $.ajax({
            url: '/builder/' + dateId + '/delete/',
            type: 'DELETE',  // Use DELETE as the HTTP method
            headers: {
                'X-CSRFToken': csrfToken, // Include the CSRF token in headers
            },
            data: JSON.stringify({
                'csrfmiddlewaretoken': csrfToken,
                'name': del_el_name,
                'id': dateId,
            }),
            dataType: 'json',
            success: function () {
                console.log('Success: The item has been deleted.');

                // You can remove the corresponding HTML element here based on `del_el_name` and `dateId`.
                if (del_el_name === 'question') {
                    $('.question[data-id="' + dateId + '"]').remove();
                } else if (del_el_name === 'question_group') {
                    $('.question-group[data-id="' + dateId + '"]').remove();
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log('Error: The DELETE request failed.');
                console.log(xhr.responseText); // Log any error response from the server
            }
        });
    });
}

// Function to get the CSRF token from cookies
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function showQuestions() {
    $(document).on('click', '.nest', function () {

        if (
            $(this).parent().next()
                .hasClass("show")
        ) {
            $(this).parent().next().removeClass("show");
            $(this).parent().next().slideUp(300);
        } else {
            $(this).parent().next().toggleClass("show");
            $(this).parent().next().slideToggle(300);
        }
    });
}


function changeHandler({target}) {
    if (!target.files.length) return;
    const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/flac']; // Add more audio types if needed

    const file = target.files[0];
    const invalidAudioAlert = $('#invalidAudioAlert');

    if (!allowedAudioTypes.includes(file.type)) {
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', 'alert-danger');
        alertDiv.innerHTML = 'Invalid file type. Please select an audio file.';
        invalidAudioAlert.show();
        setTimeout(function () {
            invalidAudioAlert.hide();
        }, 3000);


        console.log('Invalid file type');
        return;
    }
    if (file) {
        let reader = new FileReader();
        reader.onload = function (event) {
            audioFile = event.target.result;
        }
        reader.readAsDataURL(file);
    }
    // Create a blob that we can use as an src for our audio element
    const urlObj = URL.createObjectURL(target.files[0]);

    document.getElementById("audioQuestionBase").innerHTML = '';
    // Create an audio element
    audio = document.createElement("audio");
    audio.setAttribute('id', 'showAudioId')


    // Clean up the URL Object after we are done with it
    audio.addEventListener("load", () => {
        URL.revokeObjectURL(urlObj);
    });

    // Append the audio element
    document.getElementById("audioHidden").removeAttribute('hidden')
    document.getElementById("audioQuestionBase").appendChild(audio);
    // Allow us to control the audio
    audio.controls = "true";

    // Set the src and start loading the audio from the file
    audio.src = urlObj;
}

function questionAudioListener() {
    document.getElementById("questionAudioId")
        .addEventListener("change", changeHandler, false);
}

function deleteAudio() {
    $(document).on('click', '#deleteAudioId', function (event) {
        $('#audioQuestionBase').empty();
        $('#audioHidden').prop('hidden', true);
    })
}

//TODO
function questionTrueFalseChoicer(questionTrueId, questionFalseId) {
    if (questionTrueId)
        return questionTrueId
    if (questionFalseId)
        return !questionFalseId

    //TODO
    else
        return true
}

$(document).on('click', '#matchingDropDown', function (event) {
    $('#multiQuestionTable').attr('hidden', 'hidden')
    $('#TrueFalseQuestionTable').attr('hidden', 'hidden')
    $('#multiLableId').attr('hidden', 'hidden')
    $('#tfLableId').attr('hidden', 'hidden')
    $('#MathingQuestionTable').removeAttr('hidden')

})

$(document).on('click', '#trueFalseDropDown', function (event) {
    $('#TrueFalseQuestionTable').removeAttr('hidden')
    $('#multiQuestionTable').attr('hidden', 'hidden')
    $('#tfLableId').removeAttr('hidden')
    $('#multiLableId').attr('hidden', 'hidden')
    $('#MathingQuestionTable').attr('hidden', 'hidden')
})

$(document).on('click', '#multipleDropDown', function (event) {
    $('#multiQuestionTable').removeAttr('hidden')
    $('#TrueFalseQuestionTable').attr('hidden', 'hidden')
    $('#tfLableId').attr('hidden', 'hidden')
    $('#multiLableId').removeAttr('hidden')
    $('#MathingQuestionTable').attr('hidden', 'hidden')
})

function deleteImage() {
    $('#deleteImageId').on('click', function () {
        $('#showImageId').removeAttr('src');
        $('#imageHandler').attr('hidden', true);
    })
}


function addMatchingOption() {
    $(document).on('click', '#addMatchingId', function (event) {

        const newRowHtml = `
        <tr class="q-option">
            <td>
                <div class="input-group">
                    <input type="text" class="form-control" aria-label="Text input with segmented dropdown button">
                </div>
            </td>
            <td>
                <div class="input-group">
                    <input type="text" class="form-control" aria-label="Text input with segmented dropdown button">
                    <div class="input-group-append">
                        <button type="button" class="btn btn-outline-danger remove-option">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
            </td>
        </tr>`;

        $('#tbodyMatchingQ').append(newRowHtml);

    })

}

function addMultipleOption() {

    $(document).on('click', '#addOptionId', function (event) {
        const newRowHtml = `
        <tr class="q-option">
            <th scope="row">
                <div class="custom-control custom-radio">
                    <input type="radio" name="questionTrueFalse" class="custom-control-input">
                    <label class="custom-control-label"></label>
                </div>
            </th>
            <td>
                <div class="input-group">
                    <input type="text" class="form-control" aria-label="Text input with segmented dropdown button">
                    <div class="input-group-append">
                        <button type="button" class="btn btn-outline-danger remove-option">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
            </td>
        </tr>`;

        $('#tbodyMultiQ').append(newRowHtml);
    })

}