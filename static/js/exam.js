$(document).ready(function () {
    $('#examTable').DataTable();
});

const csrfToken = $("input[name=csrfmiddlewaretoken]").val();
let firstOpen = true;
let time;

function resetDateTimePicker() {
    time = firstOpen ? moment().startOf('day') : "01:00 PM";
    $('#durationInput').data('DateTimePicker').date(time);
}

$(document).on('click', '#designExam', function (event) {
    console.log('Clicked on "designExam" button');
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
    console.log(formattedStr);

    const formData = {
        'csrfmiddlewaretoken': csrfToken,
        'label': $('#label').val(),
        'deadline': formattedStr,
        'duration': $('#durationInput').val(),
    };

    $.ajax({
        url: 'exam_submit/',
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