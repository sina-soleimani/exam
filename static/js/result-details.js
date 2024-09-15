const csrfToken = $("input[name=csrfmiddlewaretoken]").val();
let id;
$(document).ready(function () {
        for (let i = 0; i < questionGroupsData.length; i++) {
            var q_num = i + 1
            var check = ''

            const question = questionGroupsData[i];
            if (question.question_type === 'TF') {
                // console.log(question.question_answers.q_is_true)

                if (question.question_answers.q_is_true === question.question_answers.is_true) {
                    check = '<div class="icon-box"><i class="fa-solid fa-circle-check success"></i></div>';
                } else {
                    check = '<div class="icon-box-uncheck"><i class="fa-solid fa-circle danger"></i></div>';
                }

                const q = '<div class="card q-result-card shadow mt-3" ><div class="card-header  text-white">' +
                    '<h5 class="card-title">سوال ' + q_num + '</h5></div><div class="card-body" style="height: 100%">' +
                    '<div class="font-weight-bold my-1" >صورت سوال : ' + question.description + '</div>' +
                    '<div class="row"><div class="col-md-3"><div class="font-weight-bold"> بارم: ' + question.score + '</div></div>' +
                    '<div class="col-md-3"><div class="font-weight-bold " > جواب دانشجو: ' + question.question_answers.is_true + '</div></div>' +
                    '<div class="col-md-3"><div class="font-weight-bold " >جواب صحیح:' + question.question_answers.q_is_true + '</div></div>' +
                    '<div class="col-md-3"><div class="font-weight-bold " >' + check +
                    '</div></div></div></div></div>'
                ;

                $('.res-det-body').append(q)
            } else if (question.question_type === 'MC') {
                var true_choice;
                var prof_choice;
                for (let j = 0; j < question.question_choices.length; j++) {
                    if (question.question_choices[j].is_true === true) {
                        true_choice = question.question_choices[j]

                    }
                    if (question.question_choices[j].id === question.answer_choice.mc_id) {
                        prof_choice = question.question_choices[j]


                    }
                }
                if (prof_choice.id === true_choice.id) {
                    check = '<div class="icon-box"><i class="fa-solid fa-circle-check success"></i></div>';
                } else {
                    check = '<div class="icon-box-uncheck"><i class="fa-solid fa-circle danger"></i></div>';
                }
                //
                const q_mc = '<div class="card q-result-card shadow mt-3" ><div class="card-header  text-white">' +
                    '<h5 class="card-title">سوال ' + q_num + '</h5></div><div class="card-body" style="height: 100%">' +
                    '<div class="font-weight-bold my-1" >صورت سوال : ' + question.description + '</div>' +
                    '<div class="row"><div class="col-md-3"><div class="font-weight-bold"> بارم: ' + question.score + '</div></div>' +
                    '<div class="col-md-3"><div class="font-weight-bold " > جواب دانشجو: ' + prof_choice.choice_text + '</div></div>' +
                    '<div class="col-md-3"><div class="font-weight-bold " >جواب صحیح:' + true_choice.choice_text + '</div></div>' +
                    '<div class="col-md-3"><div class="font-weight-bold " >' + check +
                    '</div></div></div></div></div>'
                ;
                console.log(q_mc)
                //
                $('.res-det-body').append(q_mc)
            } else if (question.question_type === 'MG') {
                console.log('MG');

                var st_answer_items = ''
                var q_items = ''
                var st_answer_match = ''
                var q_match = ''
                var mg_flag = true
                for (let j = 0; j < question.question_items.length; j++) {
                    st_answer_items += '' + question.question_items[j].item_text + '</br>'
                    st_answer_match += '' + question.question_match[j].match_text + '</br>'
                    q_match += '' + question.question_q_match[j].match_text + '</br>'
                    q_items += '' + question.question_q_items[j].item_text + '</br>'
                    console.log('before')
                    for (let k = 0; k < question.question_q_items.length; k++) {
                        console.log('equal')
                        console.log(question.question_q_items[k].id)
                        console.log(question.question_items[j].id)

                        if (question.question_q_items[k].id.toString() === question.question_items[j].id) {
                            console.log('shdkfjahsdkjfh')
                            console.log(question.question_q_match[k].id)
                            console.log(question.question_match[j].id)
                            if (question.question_q_match[k].id.toString() !== question.question_match[j].id) {
                                mg_flag = false
                            }

                        }
                    }
                }
                var mg_check = ''
                console.log('2')
                if (mg_flag) {
                    console.log('3')
                    mg_check = '<div class="icon-box"><i class="fa-solid fa-circle-check success"></i></div>';
                } else {
                    console.log('5')
                    mg_check = '<div class="icon-box-uncheck"><i class="fa-solid fa-circle danger"></i></div>';
                }

                const q_mg = '<div class="card q-result-card mt-1 shadow mt-3" ><div class="card-header  text-white">' +
                    '<h5 class="card-title">سوال ' + q_num + '</h5></div><div class="card-body" style="height: 100%">' +
                    '<div class="font-weight-bold my-1" id="descriptionContent">صورت سوال: </div><div class="row">' +
                    '<div class="col-md-6"><div class="font-weight-bold " id="score">بارم: </div></div>' +
                    '<div class="col-md-6"><div class="font-weight-bold " id="score">' + mg_check + '</div></div><div class="row">' +
                    '<div class="col-md-6"><div class="font-weight-bold " id="score">جواب دانشجو:' +
                    '<div class="row">' +
                    '<div class="col-md-3 MG_item">' + st_answer_items + '</div>' +
                    '<div class="col-md-3 MG_match">' + st_answer_match + '</div></div></div></div> <div class="col-md-6">' +
                    '<div class="font-weight-bold " id="score">جواب صحیح:<div class="row">' +
                    '<div class="col-md-3 MG_item">' + q_items + '</div><div class="col-md-3 MG_match">'
                    + q_match + '</div></div></div></div></div></div></div></div>'

                $('.res-det-body').append(q_mg)

            }
        }

    }
);

