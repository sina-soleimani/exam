var desiredId = null;
const csrfToken = $("input[name=csrfmiddlewaretoken]").val();
$(document).ready(function () {
    $('.open-modal-button').click(function () {
        desiredId = $(this).data('id');
        const element = coursesData.find(item => item.id === desiredId);
        if (element) {
            $('#label').val(element.course_name);
            $('#courseCode').val(element.course_code);
            $('#termId').val(element.term);
            $('#datePicker').val(element.year);

            $('#modal-form').modal('show');
        }
        // $('#settingQPropId').attr('hidden', 'hidden')
        // $('#settingScoreId').attr('hidden', 'hidden')
        // $('#settingPropId').removeAttr('hidden')
    });
    $('#courseTable').DataTable();


});

function resetDateTimePicker() {
    time = firstOpen ? moment().startOf('day') : "01:00 PM";
    $('#durationInput').data('DateTimePicker').date(time);
}


$('#submitButton').click(function (event) {
    const str = $('#datePicker').val().replaceAll('/', '-');
    const endstr = str.substring(str.length - 5, str.length);
    const startstr = str.substring(0, str.length - 5);
    const formattedStr = `${endstr.substring(1)}-${startstr}`;

    const formData = {
        'csrfmiddlewaretoken': csrfToken,
        'course_name': $('#label').val(),
        'year': $('#datePicker').val(),
        'course_code': $('#courseCode').val(),
        'term': $('#termId').val(),

    };
    var url;

    // if (desiredId) {
    //     url = desiredId + '/update/'
    //     console.log(typeof url)
    // } else {

    if (desiredId) {
        url = desiredId + '/update/'
        console.log(typeof url)
    } else {
        url = 'exam_submit/'
    }

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


// $(document).on('click', '#settingProp', function (event) {
//     $('#settingQPropId').attr('hidden', 'hidden')
//     $('#settingScoreId').attr('hidden', 'hidden')
//     $('#settingPropId').removeAttr('hidden')
// })


// $(document).on('click', '#settingQProp', function (event) {
//     $('#settingPropId').attr('hidden', 'hidden')
//     $('#settingScoreId').attr('hidden', 'hidden')
//     $('#settingQPropId').removeAttr('hidden')
// })


// $(document).on('click', '#settingScore', function (event) {
//     $('#settingQPropId').attr('hidden', 'hidden')
//     $('#settingPropId').attr('hidden', 'hidden')
//     $('#settingScoreId').removeAttr('hidden')
// })
// $(document).on('click', '.open-delete-modal', function (event) {
//     candidate_delete_exam = $(this).data('id')
//     $('#deleteModalLabel').html('Delete ' + findExamById(examsData, candidate_delete_exam).label + ' Exam')
// })

// function findExamById(examsData, examId) {
//     for (let i = 0; i < examsData.length; i++) {
//         const exam = examsData[i];
//         if (exam.id === examId) {
//             return exam;
//         }
//     }
// }

// $(document).on('click', '.delete-exam', function (event) {
//
//     $.ajax({
//         url: candidate_delete_exam + '/delete/',
//         type: 'DELETE',  // Use DELETE as the HTTP method
//         headers: {
//             'X-CSRFToken': csrfToken, // Include the CSRF token in headers
//         },
//         success: function () {
//             window.location.href = '/exams/list';
//         }
//     })
//
// })
