$(document).ready(function () {
    $('#examTable').DataTable();

    $("#passingScore").on("input", function() {
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
        'unanswered_penalty': $('#unAnsweredQuestionCheckBox').val(),
        'shuffle_answer': $('#shuffleAnswerCheckbox').val(),
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


document.getElementById('selectTypeScore').addEventListener('change', function () {
            const selectedOption = this.value;

            const passingScore = document.getElementById('passingScore');

            if (selectedOption === 'Percent') {

                passingScore.placeholder = 'Enter a percentage';
                passingScore.max = 100;
                passingScore.min = 0;
            } else if (selectedOption === 'Points') {
                passingScore.placeholder = 'Enter a number';
                passingScore.min=0;
            }
        });