var desiredId = null;
const csrfToken = $("input[name=csrfmiddlewaretoken]").val();
var candidate_delete_course = null;
$(document).ready(function () {
    $('#update-course-button').click(function() {
            $('#course-title').text('Update Course');
        });
    $('#new-course-button').click(function() {
            $('#course-title').text('Create New Course');
        });
    $('.open-modal-button').click(function () {
        $('#st_tbody').empty()
        desiredId = $(this).data('id');
        const element = coursesData.find(item => item.id === desiredId);
        if (element) {
            $('#label').val(element.course_name);
            $('#courseCode').val(element.course_code);
            $('#termId').val(element.term);
            $('#datePicker').val(element.year);
            $('#' + element.q_bank + '_bank').prop('checked', true);
// element.students.forEach(function(profile) {
  // Display profile information
  // console.log(profile);
// });
console.log(typeof element.students)
// var profiles = JSON.parse('{{ element.students | safe }}');
var profiles = JSON.parse( element.students );

console.log(profiles);
// $("#st_table tbody").()
                        document.getElementById("st_tbody").innerHTML = '';


            var tableBody = $("#st_tbody");
            // tableBody.empty()

profiles.forEach(function(profile) {
  // Display profile information
  console.log(profile.fields.username);
    // Create a new row and cells
  var newRow = $("<tr>");
  var cell1 = $("<td>").text(profile.fields.username);
  // var cell2 = $("<td>").text("New Cell 2");
  //
  // Append the cells to the row
  newRow.append(cell1);
  // newRow.append(cell2);

  // Append the row to the table body
  tableBody.append(newRow);

  // console.log(profile.email);
  // Add more fields as needed
});



            // for (let i; i<element.students.length;i++){
            //     console.log(element.students[i])
            // }

  // Create a new row and cells
  // var newRow = $("<tr>");
  // var cell1 = $("<td>").text("New Cell 1");
  // var cell2 = $("<td>").text("New Cell 2");
  //
  // Append the cells to the row
  // newRow.append(cell1);
  // newRow.append(cell2);

  // Append the row to the table body
  // tableBody.append(newRow);


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
        $('#student_import').attr('hidden', 'hidden')
        $('#settingPropId').removeAttr('hidden')

    });
    var table = $('#courseTable').DataTable();

    $('#courseTable thead tr').clone(true).appendTo('#courseTable thead');
    $('#courseTable thead tr:eq(1) th').each(function (i) {
        if (i > 2) {
            return false;
        }
        var title = $(this).text();
        $(this).html('<input type="text" placeholder="Search ' + title + '" />');

        $('input', this).on('keyup change', function () {
            if (table.column(i).search() !== this.value) {
                table.column(i).search(this.value).draw();
            }
        });
    });


});

function resetDateTimePicker() {
    time = firstOpen ? moment().startOf('day') : "01:00 PM";
    $('#durationInput').data('DateTimePicker').date(time);
}


$('#submitButton').click(function (event) {
    // const str = $('#datePicker').val().replaceAll('/', '-');
    // const endstr = str.substring(str.length - 5, str.length);
    // const startstr = str.substring(0, str.length - 5);
    // var formattedStr = `${endstr.substring(1)}-${startstr}`;
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
        // formattedStr = $('#datePicker').val()
    } else {
        url = 'course_submit/'
    }
    // console.log(typeof formattedStr)

    const formData = {
        'csrfmiddlewaretoken': csrfToken,
        'course_name': $('#label').val(),
        'year': '2024-01-04',
        'course_code': $('#courseCode').val(),
        'term': $('#termId').val(),
        'q_bank_id': selectedRadioButton.attr('data-id'),
        'q_bank_name': new_bank_name,

    };
    if ($('#label').val() === '' || $('#courseCode').val() === ''|| $('#termId').val() === '') {
                $("#invalidAlert").show();
                setTimeout(function () {
                    $("#invalidAlert").hide();
                }, 3000);
                return false;
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

$(document).on('click', '#settingQBank', function (event) {
    $('#settingPropId').attr('hidden', 'hidden')
    $('#student_import').attr('hidden', 'hidden')
    $('#q_bank_table').removeAttr('hidden')
    $('#submitIdBtn').removeAttr('hidden')
})

$(document).on('click', '#settingProp', function (event) {
    $('#q_bank_table').attr('hidden', 'hidden')
    $('#student_import').attr('hidden', 'hidden')
    $('#settingPropId').removeAttr('hidden')
    $('#submitIdBtn').removeAttr('hidden')
})

$(document).on('click', '#settingStudents', function (event) {
    $('#q_bank_table').attr('hidden', 'hidden')
    $('#settingPropId').attr('hidden', 'hidden')
    $('#submitIdBtn').attr('hidden', 'hidden')
    $('#student_import').removeAttr('hidden')
})

function uploadExcelFile(id) {
    var fileInput = document.getElementById('excelFileInput');
    var file = fileInput.files[0];

    if (file) {
        var formData = new FormData();
        formData.append('excelFile', file);
        formData.append('csrfmiddlewaretoken', csrfToken);
        formData.append('course_id', desiredId);


        $.ajax({
            url: 'upload_excel/', // URL where you'll handle the upload in your Django application
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                window.location.href = '/courses/list';
            },
            error: function () {
                alert('File upload failed.');
            }
        });
    } else {
        alert('Please select an Excel file to upload.');
    }
}

function findCourseById(examsData, examId) {
    for (let i = 0; i < examsData.length; i++) {
        const exam = examsData[i];
        if (exam.id === examId) {
            return exam;
        }
    }
}
