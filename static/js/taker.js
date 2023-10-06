//TODO
$(document).on('click', 'button.showqbtn', async function (event) {
        const question = findQuestionById(questionGroupsData, $(this).data('id'));

        const imageBlob = await fetchImageAsBlob(question.image);
        console.log(imageBlob)
        console.log(question.image)

        var description = question.description.replaceAll('\r\n', '<br>');

        $("#descriptionContent").html(description)
        if (imageBlob) {
            const reader = new FileReader();
            reader.onload = function (event) {
                $('#imageHandler').removeAttr('hidden');
                $('#showImageId').on('load', function () {
                    // Image loaded successfully
                    $('#qlistModal').modal('toggle');
                }).on('error', function () {
                    // Handle image loading error
                    console.error('Error loading the image.');
                });
                $('#showImageId').attr('src', event.target.result);
            };
            reader.onerror = function () {
                // Handle errors, e.g., display an error message
                console.error('Error reading the image file.');
            };

            // Read the Blob as a data URL
            reader.readAsDataURL(imageBlob);
        }
        $('#qlistModal').modal('toggle');
    }
)

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


// Create a function to fetch the image and convert it into a Blob

//TODO IMAGE
async function fetchImageAsBlob(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
}

function isValidImageType(fileType) {
    return /^image\//.test(fileType);
}