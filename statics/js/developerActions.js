let developers = []; //local state to track developers
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value; // get csrftoken from DOM

//handles updating the local developer state object
async function updateDevelopers() {
    await $.ajax({
        type: "GET",
        url: "/api/developers/",
        dataType: "json",
        success: function (response) {
            developers = response.developers;
        },
        error: function (err) {
            console.log("err: ", err);
        },
    });
}

//handles rendering the table that displays all developer elements in the database
function updateDevTable() {
    $('#main-container').empty(); // clear current main content
    let content = "<table>"; // init content to render
    for (i = 0; i < developers.length; i++) {
        content += '<tr><td><button type="button" class="btn btn-dark tbl-btn" onclick="fetchSingleDev(' + i + ')">' + developers[i].name + '</button></td></tr>'; // generate table
    }
    content += "</table>";
    $('#main-container').append(content); // append content to main container
}

// handles the rendering of a form to edit/delete a single developer
function fetchSingleDev(i) {
    $('#main-container').empty(); // clear current main content
    $form = $("<form></form>");
    $form.append(
        '<input type="hidden" name="id" value="' + developers[i].id + '">'
    );
    $form.append(
        '<div class="form-group"><label for="name">Name</label><input name="name" type="text" class="form-control" value="' + developers[i].name + '" required></div>'
    );
    $form.append(
        '<div class="form-group"><label for="bio">Bio</label><textarea name="bio" class="form-control" required>' + developers[i].bio + '</textarea></div>'
    );
    $form.append(
        '<div class="form-group"><label for="price">Price</label><input name="price" type="number" class="form-control" value="' + developers[i].price + '" min="0" step="0.01" max="200" required></div>'
    );
    $form.append(
        '<div class="form-group form-btns"><button name="delete"  class="btn btn-dark" onclick="deleteDeveloper(' + i + ')">Delete</button><button name="update"   class="btn btn-dark" onclick="updateDeveloper(' + i + ')">Update</button></div>'
    );
    $form.submit(function (e) { // prevents standard form redirect action
        return false;
    });
    $('#main-container').append($form) // appends content to main container

}

// handles the AJAX request for deleting a developer
async function deleteDeveloper(i) {
    if (confirm("Are you sure you wish to delete this developer? This action is irreversible.")) {
        const request = new Request(
            "/api/developers/" + developers[i].id + "/",
            { headers: { 'X-CSRFToken': csrftoken } }
        );
        fetch(request, {
            method: 'DELETE',
            mode: 'same-origin',
        }).then(async function (response) {
            alert("Developer deleted.")
            await updateDevelopers(); // update developers state
            $('#main-container').empty(); // clear current main content
            updateDevTable();
        });
    }
}

// handles the AJAX request for updating a developer
async function updateDeveloper(i) {
    let form_data = $('form').serializeArray();
    if (form_data[1].value == "" || form_data[2].value == "" || form_data[3] < 0 || form_data[3] > 200) { // form validation as default form submit actions are prevented
        return;
    }
    let data = {
        'id': form_data[0].value,
        'name': form_data[1].value,
        'bio': form_data[2].value,
        'price': form_data[3].value,
    }
    if (confirm("Are you sure you wish to update this developer? This action is irreversible.")) {
        const request = new Request( // generate fetch request
            "/api/developers/" + developers[i].id + "/",
            {
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json',
                }
            }
        );
        fetch(request, { // call fetch request
            method: 'PUT',
            mode: 'same-origin',
            body: JSON.stringify(data),
        }).then(async function (response) {
            alert("Developer updated.")
            await updateDevelopers(); // update developers state
            $('#main-container').empty(); // clear current main content
            fetchSingleDev(i); // rerender edited developer screen
        });
    }
}

// handles the AJAX request for adding a new developer
function addDeveloper() {
    let form_data = $('form').serializeArray();
    if (form_data[1].value == "" || form_data[2].value == "" || form_data[3] < 0 || form_data[3] > 200) { // form validation as default form submit actions are prevented
        return;
    }
    let data = {
        'name': form_data[0].value,
        'bio': form_data[1].value,
        'price': form_data[2].value,
    }
    if (confirm("Are you sure you wish to add this developer?")) {
        const request = new Request( // generate fetch request
            "/api/developers/",
            {
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json',
                }
            }
        );
        fetch(request, { // execute fetch request
            method: 'POST',
            mode: 'same-origin',
            body: JSON.stringify(data),
        }).then(async function (response) {
            alert("Developer added.")
            await updateDevelopers(); // update developers state
            $('#main-container').empty(); // clear current main content
            updateDevTable(); // rerender developer table
        });
    }
}

// event listener for the fetch developers button
$("#fetch_dev_btn").click(async function (e) {
    await updateDevelopers(); // update developers state
    updateDevTable(); // render developer table
});

// event listener for the add developer button
$("#add_dev_btn").click(async function (e) {
    $('#main-container').empty(); // clear current main content
    $form = $("<form></form>"); // construct add developer form
    $form.append(
        '<div class="form-group"><label for="name">Name</label><input name="name" type="text" class="form-control" required></div>'
    );
    $form.append(
        '<div class="form-group"><label for="bio">Bio</label><textarea name="bio" class="form-control" required></textarea></div>'
    );
    $form.append(
        '<div class="form-group"><label for="price">Price</label><input name="price" type="number" class="form-control" min="0" step="0.01" max="200" required></div>'
    );
    $form.append(
        '<div class="form-group form-btns"><button name="delete"  class="btn btn-dark" onclick="addDeveloper()">Add</button></div>'
    );
    $form.submit(function (e) { // prevent form default action
        return false;
    });
    $('#main-container').append($form) // render form
});