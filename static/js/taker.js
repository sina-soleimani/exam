const csrfToken = $("input[name=csrfmiddlewaretoken]").val();
let question;
//TODO
$(document).on('click', 'button.showqbtn', async function (event) {
        question = findQuestionById(questionGroupsData, $(this).data('id'));
        var description = question.description;
        const question_type = question.question_type
        if (question_type === 'TF') {
            $('.TF_container').removeAttr('hidden')
            $('.MC_container').attr('hidden', 'hidden')
            $('.MG_container').attr('hidden', 'hidden')
            if (question.question_answers && question.question_answers.is_true === true)
                $('#answer_true_id').prop('checked', true);
            else if (question.question_answers && question.question_answers.is_true === false)
                $('#answer_false_id').prop('checked', true);

        } else if (question_type === 'MC') {
            $('#MC_options').empty()
            $('.TF_container').attr('hidden', 'hidden')
            $('.MG_container').attr('hidden', 'hidden')
            $('.MC_container').removeAttr('hidden')
            for (let i = 0; i < question.question_choices.length; i++) {
                const choice = question.question_choices[i];
                const newRowHtml = '<input type="radio" class="btn-check" name="choice_name" id="choice_' + choice.id + '" data-id="' + choice.id + '" ' +
                    'autocomplete="off"> <label class="btn btn-outline-secondary" for="choice_' + choice.id + '">' + choice.choice_text + '</label>';
                $('#MC_options').append(newRowHtml);

            }
            if (question.question_answers)
                $('#choice_' + question.question_answers.mc_id).prop('checked', true);
        } else if (question_type === 'MG') {
            $('.MG_container').removeAttr('hidden')
            $('.MG_item').empty()
            $('.MG_match').empty()

            $('.TF_container').attr('hidden', 'hidden')
            $('.MC_container').attr('hidden', 'hidden')
            for (let i = 0; i < question.question_items.length; i++) {
                const item = question.question_items[i].item_text;
                const match = question.question_items[i].match_text;


                const newItemHtml = '<div class="sortable-item">' +
                    '<input type="radio" class="btn-check col-12" name="true_name" autocomplete="off">' +
                    '<label class="btn btn-outline-secondary col-12">' + item + '</label>' +
                    '<hr></div>';
                $('.MG_item').append(newItemHtml);

                const newMatchHtml = '<div class="sortable-item">' +
                    '<input type="radio" class="btn-check col-12" name="true_name" autocomplete="off">' +
                    '<label class="btn btn-outline-secondary col-12">' + match + '</label>' +
                    '<hr></div>';
                $('.MG_match').append(newMatchHtml);

            }


        }

        $("#descriptionContent").html(description)

        $('.close').click()
    }
)
$('.MG_item').sortable({
    connectWith: '.sortable-item',
});
$('.MG_match').sortable({
    connectWith: '.sortable-match',
});

// Add a container to hold the sortable items
$('.MG_match').addClass('sortable-match');
$('.MG_item').addClass('sortable-item');

function findQuestionById(questionGroupsData, questionId) {
    for (let i = 0; i < questionGroupsData.length; i++) {
        question = questionGroupsData[i];


        if (question.id === questionId) {
            return question;
        }
    }

    return null;
}


// Create a function to fetch the image and convert it into a Blob

//TODO IMAGE
async function fetchImageAsBlob(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
}

function isValidImageType(fileType) {
    return /^image\//.test(fileType);
}

$("#submitQAnswser").on("submit", function (event) {

    const isTrue = $("#answer_true_id").is(":checked");
    const isFalse = $("#answer_false_id").is(":checked");
    const trueFalseChoice = isTrue ? "True" : (isFalse ? "False" : null);

    var selectedRadioButton = $('input[name="choice_name"]:checked');
    if (selectedRadioButton.length > 0) {
        var selectedChoiceId = selectedRadioButton.data('id');
        console.log('Selected choice ID:', selectedChoiceId);
    } else {
        console.log('No radio button selected');
    }

    const formData = {
        'csrfmiddlewaretoken': csrfToken,
        'is_true': trueFalseChoice,
        'question_id': question.id,
        'pf_answer_id': question.question_answers ? question.question_answers.pf_answer_id : null,
        'mc_id': selectedChoiceId,
        'q_type': question.question_type,
        'result_id': $('#result_id').data('id'),
    };
    if (question.question_type === 'TF') {
        console.log('TF')
        const formData = {
            'csrfmiddlewaretoken': csrfToken,
            'is_true': trueFalseChoice,
            'question_id': question.id,
            // 'tf_id': question.question_answers.tf_id,
            'mc_id': selectedChoiceId,
            'q_type': question.question_type,
            'result_id': $('#result_id').data('id'),
        };
    } else if (question.question_type === 'MC') {
        const formData = {
            'csrfmiddlewaretoken': csrfToken,
            // 'is_true': trueFalseChoice,
            'question_id': question.id,
            // 'tf_id': question.question_answers.tf_id,
            'mc_id': selectedChoiceId,
            'q_type': question.question_type,
            'result_id': $('#result_id').data('id'),
        };
    }

    $.ajax({
        url: '/taker/answer_question/' + question.id,
        type: 'post',
        dataType: 'json',
        data: formData,
        success: (response) => {
            console.log(response);
        },
        error: (error) => {
            console.error(error);
        }
    });
});