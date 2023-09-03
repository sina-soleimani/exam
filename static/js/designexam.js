var csrfToken = $("input[name=csrfmiddlewaretoken]").val();

$(document).ready(function () {

    // onloud();

    sortQuestions();
    createQuestionGroup();
    createQuestion();





});

// console.log('salam')

function onloud() {
    var next_nest = $(".nest").next();
    next_nest.removeClass('show');
    next_nest.slideUp(300);

}

// function openQuestionGroupToggle(){
    // console.log('befor salam')
    // $(".nest").on("click", function () {
    //         console.log('salam');

        // if (
        //     $(this)
        //         .next()
        //         .hasClass("show")
        // ) {
        //     $(this)
        //         .next()
        //         .removeClass("show");
        //     $(this)
        //         .next()
        //         .slideUp(300);
        // } else {
        //     $(this)
        //         .next()
        //         .toggleClass("show");
        //     $(this)
        //         .next()
        //         .slideToggle(300);
        // }
    // });
// }

function createQuestion(){
        $("#create_question_button").click(function () {
        var question_audio =$(".question-audio").val();
        var createQuestionForm=$("#createQuestionForm");
        


        var serializedData = createQuestionForm.serialize();
        serializedData.append("audio",question_audio)
        console.log(typeof serializedData);
        $.ajax({
            url: createQuestionForm.data('url'),
            data: serializedData,
            type: 'post',
            success: function (response) {
                console.log(response.new_question_group.id);
                console.log(response.new_question.id);

                var question_group_list_id=$("#question-group-list-id");
                question_group_list_id.append('<li class="question-group" data-id="' +
                    response.new_question_group.id + '"><div class="d-flex tag-btn"><a class="nest">'+
                    response.new_question_group.name +'</a><button type="button" class="close float-right" data-id="' +
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
        console.log("dgdfdddx");
        var serializedData = $("#createQuestionGroupForm").serialize();
        console.log('123');
        $.ajax({
            url: $("#createQuestionGroupForm").data('url'),
            data: serializedData,
            type: 'post',
            success: function (response) {
                console.log(response.new_question_group.id);

                var question_group_list_id=$("#question-group-list-id");
                question_group_list_id.append('<li class="question-group" data-id="' +
                    response.new_question_group.id + '"><div class="d-flex tag-btn"><a class="nest">'+
                    response.new_question_group.name +'</a><button type="button" class="close float-right" data-id="' +
                    response.new_question_group.id +
                    '"><span aria-hidden="true">&times;</span></button></div><ul class="question-list mr-2 inner "  data-id="' +
                    response.new_question_group.id + '">' +'<li class="question"></li></ul></li>');
                    console.log('444')
            },

        });
        $("#createQuestionGroupForm")[0].reset();

    })
}
function sortQuestions(){
    // $('.question-group').on('click', function () {
    //     $('.question-group').not(this).find('div').hide();
    //     $(this).find('div').toggle();
    // });
    // $(function () {
    //     console.log($(this).get())
    //     console.log('12312')

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
                        url: '/tasks/sort_questions/',
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

    // });
}

$(document).on('click', 'button.close', function(event){
        console.log('close');
        event.stopPropagation();
        var dateId = $(this).data('id');

        console.log('close 2');
        console.log(dateId);
        $.ajax({
            url: '/tasks/' + dateId + '/delete/',
            data: {
                csrfmiddlewaretoken: csrfToken,
                id: dateId
            },
            type: 'post',
            dataType: 'json',
            success: function () {
                console.log('aksdjlas')
                // if ($('#questionGroupCard[data-id="' + dateId + '"]').attr('class').indexOf("witJs") >= 0) {
                //     $('#questionGroupCard[data-id="' + dateId + '"]').parent().remove();
                //
                // } else {
                    $('.question-group[data-id="' + dateId + '"]').remove();
                // }
            }
        })
})
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