var desiredId = null;
var candidate_delete_exam = null;
$(document).ready(function () {
    $('.open-modal-button').click(function () {
        desiredId = $(this).data('id');
        const element = examsData.find(item => item.id === desiredId);
        if (element) {
            console.log(element);
            $('#label').val(element.label);
            // 'deadline': formattedStr,
            $('#durationInput').val(element.duration);
            $('#datePicker').val(element.deadline.replaceAll('-', '/'));
            $('#selectTypeScore').val(element.score_type);
            $('#passingScore').val(element.point_passing_score);
            // 'percent_passing_score': $('#passingScore').val(),
            $('#incorrectPenalty').val(element.incorrect_penalty);
            $("#unAnsweredQuestionCheckBox").prop('checked', element.unanswered_penalty);
            $("#shuffleAnswerCheckbox").prop('checked', element.shuffle_answer);
            $('#modal-form').modal('show');
        }
        $('#settingQPropId').attr('hidden', 'hidden')
        $('#settingScoreId').attr('hidden', 'hidden')
        $('#settingPropId').removeAttr('hidden')
    });
    $('#examTable').DataTable();

    $("#passingScore").on("input", function () {
        if ($(this).attr('max') === '100') {
            var inputValue = $(this).val();
            var parsedValue = parseFloat(inputValue);

            if (isNaN(parsedValue) || parsedValue > 100) {
                const alert = $('#invalidNumberAlert');
                alert.show();
                // Hide the alert if it was previously displayed
                setTimeout(function () {
                    alert.hide();
                }, 3000);


                $(this).val("");

            }
        }
    });

});


const csrfToken = $("input[name=csrfmiddlewaretoken]").val();
let firstOpen = true;
let time;

function resetDateTimePicker() {
    time = firstOpen ? moment().startOf('day') : "01:00 PM";
    $('#durationInput').data('DateTimePicker').date(time);
}

$(document).on('click', '#designExam', function (event) {
    $.ajax({
        url: '/form/',
        type: "post",
        data: {
            'csrfmiddlewaretoken': csrfToken,
        },
        success: (res) => {
            console.log('Form submitted successfully');
        }
    });
});

$('#durationInput').datetimepicker({
    useCurrent: false,
    format: "hh:mm:ss"
}).on('dp.show', resetDateTimePicker);

$('#submitButton').click(function (event) {
    const str = $('#datePicker').val().replaceAll('/', '-');
    const endstr = str.substring(str.length - 5, str.length);
    const startstr = str.substring(0, str.length - 5);
    const formattedStr = `${endstr.substring(1)}-${startstr}`;

    const formData = {
        'csrfmiddlewaretoken': csrfToken,
        'label': $('#label').val(),
        'deadline': formattedStr,
        'duration': $('#durationInput').val(),
        'score_type': $('#selectTypeScore').val(),
        'point_passing_score': $('#passingScore').val(),
        'percent_passing_score': $('#passingScore').val(),
        'incorrect_penalty': $('#incorrectPenalty').val(),
        'unanswered_penalty': $('#unAnsweredQuestionCheckBox').prop('checked'),
        'shuffle_answer': $('#shuffleAnswerCheckbox').prop('checked'),
    };
    var url;

    if (desiredId) {
        url = desiredId + '/update/'
        console.log(typeof url)
    } else {
        url = 'exam_submit/'
    }
    console.log(url)

    $.ajax({
        url: url,
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


document.getElementById('selectTypeScore').addEventListener('change', function () {
    const selectedOption = this.value;

    const passingScore = document.getElementById('passingScore');

    if (selectedOption === 'Percent') {

        passingScore.placeholder = 'Enter a percentage';
        passingScore.max = 100;
        passingScore.min = 0;
    } else if (selectedOption === 'Points') {
        passingScore.placeholder = 'Enter a number';
        passingScore.min = 0;
    }
});

$(document).on('click', '#settingProp', function (event) {
    $('#settingQPropId').attr('hidden', 'hidden')
    $('#settingScoreId').attr('hidden', 'hidden')
    $('#settingPropId').removeAttr('hidden')
})


$(document).on('click', '#settingQProp', function (event) {
    $('#settingPropId').attr('hidden', 'hidden')
    $('#settingScoreId').attr('hidden', 'hidden')
    $('#settingQPropId').removeAttr('hidden')
})


$(document).on('click', '#settingScore', function (event) {
    $('#settingQPropId').attr('hidden', 'hidden')
    $('#settingPropId').attr('hidden', 'hidden')
    $('#settingScoreId').removeAttr('hidden')
})
$(document).on('click', '.open-delete-modal', function (event) {
    candidate_delete_exam = $(this).data('id')
})


$(document).on('click', '.delete-exam', function (event) {

    $.ajax({
        url:  candidate_delete_exam + '/delete/',
        type: 'DELETE',  // Use DELETE as the HTTP method
        headers: {
            'X-CSRFToken': csrfToken, // Include the CSRF token in headers
        },
        success: function () {
            window.location.href = '/exams/list';
        }
    })

})