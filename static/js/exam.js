var desiredId = null;
var candidate_delete_exam = null;
var candidate_active_exam = null;
$(document).ready(function () {
    $('.open-modal-button').click(function () {
        $('.numberSelect').val(0);
        $('#settingQPropId').attr('hidden', 'hidden')
        $('#table-q-bank').attr('hidden', 'hidden')
        $('#settingScoreId').attr('hidden', 'hidden')
        $('#settingPropId').removeAttr('hidden')
        desiredId = $(this).data('id');
        const element = examsData.find(item => item.id === desiredId);
        const countById = {};
        element['q_bank'].forEach(e => {
            const id = e['id'];
            countById[id] = (countById[id] || 0) + 1;
        });
        for (const key in countById) {
            if (countById.hasOwnProperty(key)) {
                const value = countById[key];

                var $selectElement = $(".numberSelect[data-id=" + key + "]");

                // Set the selected value to 6
                $selectElement.val(value);
            }
        }
        console.log(countById);
        if (element) {
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
        } else {
            $('#label').val('');
            // 'deadline': formattedStr,
            $('#durationInput').val('');
            $('#datePicker').val('');
            $('#selectTypeScore').val('');
            $('#passingScore').val('');
            // 'percent_passing_score': $('#passingScore').val(),
            $('#incorrectPenalty').val('');
            $("#unAnsweredQuestionCheckBox").prop('checked', false);
            $("#shuffleAnswerCheckbox").prop('checked', false);
            $('#modal-form').modal('show');
        }

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
        'selected_groups_id': $('.numberSelect').map(function () {
            return $(this).data('id');
        }).get(),
        'selected_groups_num': $('.numberSelect').map(function () {
            return $(this).val();
        }).get(),
    };
    var url;

    if (desiredId) {
        url = 'update/' + desiredId + '/'
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
            window.location.href = '/exams/' + examsData[0].course_id + '/list';
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
    $('#table-q-bank').attr('hidden', 'hidden')
    $('#settingPropId').removeAttr('hidden')
})


$(document).on('click', '#settingQProp', function (event) {
    $('#settingPropId').attr('hidden', 'hidden')
    $('#settingScoreId').attr('hidden', 'hidden')
    $('#table-q-bank').attr('hidden', 'hidden')
    $('#settingQPropId').removeAttr('hidden')
})


$(document).on('click', '#settingScore', function (event) {
    $('#settingQPropId').attr('hidden', 'hidden')
    $('#settingPropId').attr('hidden', 'hidden')
    $('#table-q-bank').attr('hidden', 'hidden')
    $('#settingScoreId').removeAttr('hidden')
})
$(document).on('click', '#qListId', function (event) {
    $('#settingQPropId').attr('hidden', 'hidden')
    $('#settingPropId').attr('hidden', 'hidden')
    $('#settingScoreId').attr('hidden', 'hidden')
    $('#table-q-bank').removeAttr('hidden')
})
$(document).on('click', '.open-delete-modal', function (event) {
    candidate_delete_exam = $(this).data('id')
    $('#deleteModalLabel').html('Delete ' + findExamById(examsData, candidate_delete_exam).label + ' Exam')
})

function findExamById(examsData, examId) {
    for (let i = 0; i < examsData.length; i++) {
        const exam = examsData[i];
        if (exam.id === examId) {
            return exam;
        }
    }
}

$(document).on('click', '.delete-exam', function (event) {

    $.ajax({
        url: candidate_delete_exam + '/delete/',
        type: 'DELETE',  // Use DELETE as the HTTP method
        headers: {
            'X-CSRFToken': csrfToken, // Include the CSRF token in headers
        },
        success: function () {
            window.location.href = '/exams/' + examsData[0].course_id + '/list';
        }
    })

})
$(document).on('click', '.open-active-modal', function (event) {
    candidate_active_exam = $(this).data('id')
    $('#activeModalLabel').html('Active ' + findExamById(examsData, candidate_active_exam).label + ' Exam')
})

$(document).on('click', '.active-exam', function (event) {
    console.log(candidate_active_exam)

    $.ajax({
        url: candidate_active_exam + '/active/',
        type: "post",
        headers: {
            'X-CSRFToken': csrfToken, // Include the CSRF token in headers
        },
        success: function () {
            window.location.href = '/exams/' + examsData[0].course_id + '/list';
        }
    })

})