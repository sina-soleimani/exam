var desiredId = null;
const csrfToken = $("input[name=csrfmiddlewaretoken]").val();
var candidate_delete_course = null;
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

$(document).on('click', '.open-delete-modal', function (event) {
    candidate_delete_course = $(this).data('id')
    $('#deleteModalLabel').html('Delete ' + findCourseById(coursesData, candidate_delete_course).course_name + ' Course')
})


$(document).on('click', '.delete-course', function (event) {

    $.ajax({
        url: candidate_delete_course + '/delete/',
        type: 'DELETE',  // Use DELETE as the HTTP method
        headers: {
            'X-CSRFToken': csrfToken, // Include the CSRF token in headers
        },
        success: function () {
            console.log('done')
            window.location.href = '/courses/list';
        }
    })

})


function findCourseById(examsData, examId) {
    for (let i = 0; i < examsData.length; i++) {
        const exam = examsData[i];
        if (exam.id === examId) {
            return exam;
        }
    }
}
