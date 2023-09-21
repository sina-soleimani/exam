const csrfToken = getCookie('csrftoken');
let audio = '';
let audioFile;
let qg_selected_id = null;

$(document).ready(function () {
    sortQuestions();
    createQuestionGroup();
    createQuestion();
    chooseImage();

    deleteImage();
    addMatchingOption();
    addMultipleOption();
    findSelectedQG();

});

deleteAudio();
questionAudioListener();
showQuestions();
deleteQuestionAndQuestionGroup();


function findSelectedQG(){
    let selectedElement = null;

    // Click event handler for li.question elements
    $(document).on("click", "div.select-btn", function () {
        console.log('salam')
        // Remove the "q_selected" class from the previously selected element (if any)
        if (selectedElement) {
            $(selectedElement).removeClass("q_selected");
        }
        var lastQuestion = $(this).find('ul.question-list li.question:last');
        qg_selected_id = $(this).closest('li.question-group').data('id')
        $(this).addClass("q_selected");

        selectedElement = this;
    });

}
// TODO
function createQuestion() {
    $("#createQuestionForm").on("submit", function (event) {
        event.preventDefault(); // Prevent the default form submission

        const isTrue = $("#questionTrueId").is(":checked");
        const isFalse = $("#questionFalseId").is(":checked");
        const trueFalseChoice = isTrue ? "true" : (isFalse ? "false" : null);
        var score = $("#baremId").val();
        var description = $("#questionTextarea").val()
        const isTFValid = handleFormValidation("#invalidTFAlert", trueFalseChoice);
        const isValid = handleFormValidation("#invalidDescriptionAlert", "#questionTextarea");
        if (!isValid) {
            // Validation failed, do not proceed with form submission
            return;
        }
        if (!isTFValid) {
            // Validation failed, do not proceed with form submission
            return;
        }

        var question_group__id = (qg_selected_id === null) ? $('.menu-list li:first').attr('data-id') : qg_selected_id;
        console.log(qg_selected_id)
        console.log($('.menu-list li:first'))

        const formData = new FormData(this);
        formData.append("is_true", trueFalseChoice);
        formData.append("csrfmiddlewaretoken", csrfToken);
        formData.append("description", description);
        formData.append("question_group__id", question_group__id);
        formData.append("score", score);
        formData.append("question_type", "TF");
        formData.forEach(function (value, key) {
            console.log(key + ": " + value);
        });
        console.log(formData)

        $.ajax({
            url: $(this).data("url"),
            type: 'post',
            headers: {
                'X-CSRFToken': csrfToken, // Include the CSRF token in headers
            },
            processData: false,
            contentType: false,
            data: formData,
            success: function (response) {
                console.log('done')
                console.log(description)
                var $questionGroup = $('li.question-group[data-id=' + question_group__id + ']');

                // Check if the element was found

                // Create a new nested li element
                // Append the new nested li to the found question-group li

                var $newNestedLi = $('<li class="question"><div class="d-flex tag-btn select-btn">\<a class="flex-grow-1 ">' + description +
                    '</a><button type="button" class="close float-right" name="question" ' +
                    'data-id="{{ question.id }}"><span aria-hidden="true">&times;</span></button></div></li></li>');
                $questionGroup.find('ul.question-list').append($newNestedLi);


            },
            error: function (xhr, textStatus, errorThrown) {
                // Handle errors here
                console.log('not done')
            }

        });
        this.reset();

    })
}

function handleFormValidation(alertSelector, fieldName) {
    const field = $(fieldName);
    console.log(field);

    if (!field || field.val() === undefined || field.val().length === 0) {
        const alert = $(alertSelector);
        alert.show();
        // Hide the alert if it was previously displayed
        setTimeout(function () {
            alert.hide();
        }, 3000);
        return false; // Return false to indicate validation failed
    }

    return true; // Return true to indicate validation passed
}


function createQuestionGroup() {
    $("#createQuestionGroupButton").click(function () {
        var createQuestionGroupForm = $("#createQuestionGroupForm");
        var serializedData = createQuestionGroupForm.serialize();
        const isValid = handleFormValidation("#invalidQGNameAlert", "#id_name");
        if (!isValid) {
            return;
        }


        $.ajax({
            url: this.url,
            data: serializedData,
            type: 'post',
            success: function (response) {

                var question_group_list_id = $("#question-group-list-id");
                question_group_list_id.append('<li class="question-group" data-id="' +
                    response.new_question_group + '"><div class="d-flex tag-btn select-btn"><a class="nest">' +
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