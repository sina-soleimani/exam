//TODO
$(document).on('click', 'button.showqbtn', function (event) {
    const question = findQuestionById(questionGroupsData, $(this).data('id'));

    var description = question.description.replaceAll('\r\n', '<br>');
    $("#descriptionContent").html(description)

    $('#qlistModal').modal('toggle');
})

function findQuestionById(questionGroupsData, questionId) {
    for (let i = 0; i < questionGroupsData.length; i++) {
        const group = questionGroupsData[i];

        for (let j = 0; j < group.questions.length; j++) {
            const question = group.questions[j];

            if (question.id === questionId) {
                return question;
            }
        }
    }

    // If the question is not found, return null
    return null;
}
