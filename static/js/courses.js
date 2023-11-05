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
            $('#' + element.q_bank + '_bank').prop('checked', true);

            $('#modal-form').modal('show');
        } else {

            $('#label').val('');
            $('#courseCode').val('');
            $('#termId').val('');
            $('#datePicker').val('');

            $("input[name='selected_bank']").prop('checked', false);

            $('#modal-form').modal('show');

        }

        $('#q_bank_table').attr('hidden', 'hidden')
        $('#settingPropId').removeAttr('hidden')

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
    var formattedStr = `${endstr.substring(1)}-${startstr}`;
    const selectedRadioButton = $('input[name="selected_bank"]:checked');

    if (selectedRadioButton.length > 0) {
        var new_bank_name;
        if (selectedRadioButton.attr('data-id') === 'new_bank') {
            new_bank_name = $('#new_bank_input').val()

        }
    } else {
        console.log("No radio button selected.");
    }

    var url;


    if (desiredId) {
        url = desiredId + '/update/'
        formattedStr = $('#datePicker').val()
    } else {
        url = 'course_submit/'
    }

    const formData = {
        'csrfmiddlewaretoken': csrfToken,
        'course_name': $('#label').val(),
        'year': formattedStr,
        'course_code': $('#courseCode').val(),
        'term': $('#termId').val(),
        'q_bank_id': selectedRadioButton.attr('data-id'),
        'q_bank_name': new_bank_name,

    };


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

$(document).on('click', '#settingQBank', function (event) {
    $('#settingPropId').attr('hidden', 'hidden')
    $('#q_bank_table').removeAttr('hidden')
})

$(document).on('click', '#settingProp', function (event) {
    $('#q_bank_table').attr('hidden', 'hidden')
    $('#settingPropId').removeAttr('hidden')
})


function findCourseById(examsData, examId) {
    for (let i = 0; i < examsData.length; i++) {
        const exam = examsData[i];
        if (exam.id === examId) {
            return exam;
        }
    }
}
