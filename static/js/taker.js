const csrfToken = $("input[name=csrfmiddlewaretoken]").val();
let question;

function showQuestion(question) {
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
        const itemTextArray = question.question_items.map(item => item.item_text);
        const matchTextArray = question.question_match.map(item => item.match_text);

        const yourItemTextArray = ["Item1", "Item2", "Item3", "Item4"];

        for (let i = 0; i < question.question_items.length; i++) {
            const item = question.question_items[i];
            const match = question.question_match[i];


            const newItemHtml = '<div class="sortable-item">' +
                '<input type="radio" class="btn-check col-12 item_inputs" data-id=' + item.id + ' name="true_name" autocomplete="off">' +
                '<label class="btn btn-outline-secondary col-12 item_labels" data-value=' + item.item_text + ' > ' + item.item_text + '</label>' +
                '<hr></div>';
            $('.MG_item').append(newItemHtml);

            const newMatchHtml = '<div class="sortable-item">' +
                '<input type="radio" class="btn-check col-12 match_inputs" name="true_name" data-id=' + match.id + ' autocomplete="off">' +
                '<label class="btn btn-outline-secondary col-12 match_labels" data-value=' + match.match_text + ' > ' + match.match_text + '</label>' +
                '<hr></div>';
            $('.MG_match').append(newMatchHtml);

        }


    }

    $("#descriptionContent").html(description)

}

//TODO
$(document).on('click', 'button.showqbtn', async function (event) {
        question = findQuestionById(questionGroupsData, $(this).data('id'))
        showQuestion(question)

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

$(document).ready(function () {
    findQuestionById(questionGroupsData, nextQuestion.id)
    showQuestion(nextQuestion)
    console.log('end')
    $('.open-modal-button').click(function () {
        $('#q-list-id').empty();
        var check_q = null
        questionGroupsData.forEach(e => {
            if (e.question_answers) {
                check_q = '<div class="icon-box"><i class="fa-solid fa-circle-check success"></i></div>'
            } else {
                check_q = '<div class="icon-box-uncheck"><i class="fa-solid fa-circle danger"></i></div>'
            }
            var add_tr = '<tr><td class="q-desc">' + e.question_type + '</td><td>' + e.score + '</td><td>' +
                '<button type="button" class="btn btn-outline-success showqbtn" data-id=' + e.id + '>' +
                '<i class="fa fa-eye" aria-hidden="true"></i></button></td><td>' + check_q + '</td></tr>'
            $('#q-list-id').append(add_tr)
        });
    })
})

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
        'item_ids': $('.item_inputs').map(function () {
            return $(this).data('id');
        }).get(),
        'match_ids': $('.match_inputs').map(function () {
            return $(this).data('id');
        }).get(),
        'item_texts': $('.item_labels').map(function () {
            return $(this).text();
        }).get(),
        'match_texts': $('.match_labels').map(function () {
            return $(this).text();
        }).get(),
        'q_type': question.question_type,
        'result_id': $('#result_id').data('id'),
    };
    if (question.question_type === 'TF') {
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