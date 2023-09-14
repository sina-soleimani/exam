const csrfToken = $("input[name=csrfmiddlewaretoken]").val();
var audio='';
var audioFile;

$(document).ready(function () {

    sortQuestions();
    createQuestionGroup();
    createQuestion();
    chooseImage();
// $('#dropdown-menu-id').change(function(){
//     console.log('dropdown-menu')
// })


});

deleteAudio();
deleteImage();
questionAudioListener();
showQuestions();
deleteQuestionAndQuestionGroup();




// TODO
function createQuestion(){
        $("#createQuestionForm").submit(function (event) {
            console.log('213')

            var questionTrueId=$( "#questionTrueId" ).is( ":checked" );
            var questionFalseId=$( "#questionFalseId" ).is( ":checked" );

            var trueFalseChoicer = questionTrueFalseChoicer(questionTrueId,questionFalseId)
        // console.log($("#audioQuestionBase").children('audio')[0].src)
            // $( "#customRadio1" ).is( "checked", true );
            console.log(audioFile)
            console.log(document.getElementById("showImageId").src)
            var question_form= new FormData();
            // question_form.append("file" ,audioFile);

            question_form.append("csrfmiddlewaretoken", csrfToken);

            question_form.append("description" ,$("#questionTextarea").val());
            // question_form.append("image" ,document.getElementById("showImageId").src);
            question_form.append("true_false" ,trueFalseChoicer);
            //
             for (var key of question_form.entries()) {
        console.log(key[0] + ', ' + key[1]);
    }

            if (question_form.length===0){
                console.log('shod')
            }
            else
                console.log('nashod')



        var createQuestionForm=$("#createQuestionForm");
        console.log('start')
        console.log(question_form)




        $.ajax({
            url: '/create_question/',
            type: 'post',
            processData: false ,
            contentType:false,
            // mimeType: "multipart/form-data",
            data: question_form,

            success: function (response) {
                console.log(response.new_question_group.id);
                console.log(response.new_question.id);

                var question_group_list_id=$("#question-group-list-id");
                question_group_list_id.append('<li class="question-group" data-id="' +
                    response.new_question_group.id + '"><div class="d-flex tag-btn"><a class="nest">'+
                    response.new_question_group.name +'</a><button type="button" class="close float-right" name="qu" data-id="' +
                    response.new_question_group.id +
                    '"><span aria-hidden="true">&times;</span></button></div><ul class="question-list mr-2 inner "  data-id="' +
                    response.new_question_group.id + '">' +'<li class="question"></li></ul></li>');
                    console.log('444')
            },

        });
        $("#createQuestionGroupForm")[0].reset();

    })
}



function createQuestionGroup(){
        $("#createQuestionGroupButton").click(function () {
        var createQuestionGroupForm    = $("#createQuestionGroupForm");
        var serializedData = createQuestionGroupForm.serialize();
        console.log('createQuestionGroup');
        $.ajax({
            url: createQuestionGroupForm.data('url'),
            data: serializedData,
            type: 'post',
            success: function (response) {
                console.log('createQuestionGroup success');

                var question_group_list_id=$("#question-group-list-id");
                question_group_list_id.append('<li class="question-group" data-id="' +
                    response.new_question_group.id + '"><div class="d-flex tag-btn"><a class="nest">'+
                    response.new_question_group.name +'</a><button type="button" class="close float-right" name="question_group" data-id="' +
                    response.new_question_group.id +
                    '"><span aria-hidden="true">&times;</span></button></div><ul class="question-list mr-2 inner "  data-id="' +
                    response.new_question_group.id + '">' +'<li class="question"></li></ul></li>');
            },

        });
        createQuestionGroupForm[0].reset();

    })
}
function sortQuestions(){
        $('.sortable').nestedSortable({
            forcePlaceholderSize: true,
            items: 'li',
            handle: 'a',
            placeholder: 'menu-highlight',
            listType: 'ul',
            maxLevels: 3,
            opacity: .6,
            stop: function (event, ui) {

                var qg_list = ui.item.parent().attr('class').indexOf("question-group-list") >= 0;
                var q_list = ui.item.parent().attr('class').indexOf("question-list") >= 0;
                var qg = ui.item.attr('class').indexOf("question-group") >= 0;

                var q = ui.item.attr('class').indexOf("question") >= 0;

                console.log(qg);
                console.log();

                if (qg_list         // if it's a group...
                    && !q_list && !qg)// but moved within another group
                {
                    $(this).sortable('cancel');           // cancel the sorting!
                }
                if (!qg_list         // if it's a group...
                    && q_list && qg)// but moved within another group
                {
                    $(this).sortable('cancel');           // cancel the sorting!
                }
            },
            update: function (e, ui) {
                var qg_id = ui.item.parent().attr('data-id');
                var q_id = ui.item.attr('data-id');
                if (qg_id && q_id) {
                    $.ajax({
                        url: '/tasks/' + qg_id + '/sort_questions/',
                        type: 'post',
                        data: {csrfmiddlewaretoken: csrfToken, question_group_id: qg_id, question_id: q_id},
                        success: function (request) {
                            $('.sortable');
                        }
                    })
                }
            }
        });

}

function chooseImage(){
    $('#questionImageId').change(function(){
        const file = this.files[0];
        console.log(file);
        if (file){
          let reader = new FileReader();
          reader.onload = function(event){
            console.log(event.target.result);
            $('#imageHandler').removeAttr('hidden');
            $('#showImageId').attr('src', event.target.result);
          }
          reader.readAsDataURL(file);
        }
      });
}

function findAncestor (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls))
    return el;
}
$(document).on('click', 'button.remove-option', function (event) {
    // console.log(findAncestor($(this),'q-option'))
    // console.log(event.closest('.q-option'));
    // console.log(event.target);
    // console.log(event);
    // const child = document.getElementById('child');

// const parentWithClass = child.closest('.parent');
    $(this).parent().parent().parent().parent().remove();
    // $(this).parent('tr').innerHTML='';
    event.stopPropagation();
    // var dateId = $(this).data('id');
})

function deleteQuestionAndQuestionGroup() {
    $(document).on('click', 'button.close', function (event) {
        console.log('close');
        event.stopPropagation();
        var dateId = $(this).data('id');

        console.log('close 2');
        var del_el_name = $(this).attr('name')
        console.log($(this).attr('name'));
        console.log($(this).attr('name').indexOf("question-group"));
        $.ajax({
            url: '/tasks/' + dateId + '/delete/',
            data: {
                csrfmiddlewaretoken: csrfToken,
                id: dateId,
                name: $(this).attr('name')
            },
            type: 'post',
            dataType: 'json',
            success: function () {
                console.log('aksdjlas')
                // if ($('#questionGroupCard[data-id="' + dateId + '"]').attr('class').indexOf("witJs") >= 0) {
                //     $('#questionGroupCard[data-id="' + dateId + '"]').parent().remove();
                //
                // } else {
                console.log(del_el_name)
                if (del_el_name === 'question') {
                    $('.question[data-id="' + dateId + '"]').remove();
                } else if (del_el_name === 'question_group') {
                    $('.question-group[data-id="' + dateId + '"]').remove();

                }
                // }
            }
        })
    })
}
function showQuestions(){
$(document).on('click', '.nest', function(){
    console.log($(this).parent().next())

        if (
            $(this).parent().next()
                .hasClass("show")
        ) {
            console.log('allow')
            $(this).parent().next().removeClass("show");
            $(this).parent().next().slideUp(300);
        } else {
            $(this).parent().next().toggleClass("show");
            $(this).parent().next().slideToggle(300);
        }
});
}


function changeHandler({
  target
}) {
    console.log('asasallll')
  // Make sure we have files to use
  if (!target.files.length) return;
  // console.log(target[0].files[0])

  const file = target.files[0];
        console.log(file);
        if (file){
            console.log(file.result)
          let reader = new FileReader();
            console.log(file)
          reader.onload = function(event){
            console.log(event.target.result);
            audioFile=event.target.result;
            // audioFile=file;
                        console.log(audioFile);


            // $('#imageHandler').removeAttr('hidden');
            // $('#showImageId').attr('src', event.target.result);
          }
          reader.readAsDataURL(file);
        }
  // Create a blob that we can use as an src for our audio element
  const urlObj = URL.createObjectURL(target.files[0]);
  console.log('ssas')

        document.getElementById("audioQuestionBase").innerHTML = '';
  // Create an audio element
  audio = document.createElement("audio");
  audio.setAttribute('id','showAudioId')


  // Clean up the URL Object after we are done with it
  audio.addEventListener("load", () => {
    URL.revokeObjectURL(urlObj);
  });

  // Append the audio element
  document.getElementById("audioHidden").removeAttribute('hidden')
  document.getElementById("audioQuestionBase").appendChild(audio);
  // document.getElementById('questionAudioId').value = null;

  // Allow us to control the audio
  audio.controls = "true";

  // Set the src and start loading the audio from the file
  audio.src = urlObj;
}

function questionAudioListener(){
document.getElementById("questionAudioId")
  .addEventListener("change", changeHandler, false);
}
function deleteAudio() {
    $(document).on('click', '#deleteAudioId', function (event) {
        document.getElementById("audioQuestionBase").innerHTML = '';
        $('#audioHidden').attr('hidden', 'hidden')
    })
}
function questionTrueFalseChoicer(questionTrueId,questionFalseId){
            if (questionTrueId)
                return questionTrueId
            if (questionFalseId)
                return !questionFalseId

    //TODO
            else
                return true
        }

$(document).on('click', '#matchingDropDown', function (event) {
    $('#multiQuestionTable').attr('hidden', 'hidden')
    $('#TrueFalseQuestionTable').attr('hidden', 'hidden')
    $('#multiLableId').attr('hidden', 'hidden')
    $('#tfLableId').attr('hidden', 'hidden')
    $('#MathingQuestionTable').removeAttr('hidden')

})

$(document).on('click', '#trueFalseDropDown', function (event) {
    $('#TrueFalseQuestionTable').removeAttr('hidden')
    $('#multiQuestionTable').attr('hidden', 'hidden')
    $('#tfLableId').removeAttr('hidden')
    $('#multiLableId').attr('hidden', 'hidden')
    $('#MathingQuestionTable').attr('hidden', 'hidden')
})

$(document).on('click','#multipleDropDown', function (event){
          $('#multiQuestionTable').removeAttr('hidden')
          $('#TrueFalseQuestionTable').attr('hidden','hidden')
    $('#tfLableId').attr('hidden','hidden')
    $('#multiLableId').removeAttr('hidden')
        $('#MathingQuestionTable').attr('hidden', 'hidden')


        })
        function deleteImage(){
    $(document).on('click', '#deleteImageId', function(event){
        $('#showImageId').removeAttr('src')

            $('#imageHandler').attr('hidden','hidden');
            $('#showImageId').attr('src', event.target.result);


})
}

    $(document).on('click', '#addOptionId', function(event){
        console.log('sala')
        $('#tbodyMultiQ').append('<tr class="q-option"><th scope="row"><div class="custom-control custom-radio">' +
            '<input type="radio" id="questionFalseId4" name="questionTrueFalse" class="custom-control-input">' +
            '<label class="custom-control-label" for="questionFalseId4"></label></div></th><td><div class="input-group">' +
            '<input type="text" class="form-control" aria-label="Text input with segmented dropdown button"> ' +
            '<div class="input-group-append"> <button type="button" class="btn btn-outline-danger  remove-option">' +
            '<i class=\'fa fa-trash\'></i></button> </div> </div> </td> </tr>')
    })

 $(document).on('click', '#addMatchingId', function(event){
        console.log('sala')
        $('#tbodyMatchingQ').append('<tr class="q-option"><td><div class="input-group"><input type="text" class="form-control" ' +
            'aria-label="Text input with segmented dropdown button"></div></td><td><div class="input-group"><input type="text" ' +
            'class="form-control" aria-label="Text input with segmented dropdown button">' +
            '<div class="input-group-append"> <button type="button" class="btn btn-outline-danger  remove-option">' +
            '<i class=\'fa fa-trash\'></i></button> </div> </div> </td> </tr>')
    })