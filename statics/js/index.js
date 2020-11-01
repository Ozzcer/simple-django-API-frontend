let developers = []; //local state to track developers
let projects = []; //local state to track projects
const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value; // get csrftoken from DOM

/**
 * The following functions handle all reactive components related to developers
 */

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
  $("#main-container").empty(); // clear current main content
  let content = "<table>"; // init content to render
  for (i = 0; i < developers.length; i++) {
    content +=
      '<tr><td><button type="button" class="btn btn-dark tbl-btn" onclick="fetchSingleDeveloper(' +
      i +
      ')">' +
      developers[i].name +
      "</button></td></tr>"; // generate table
  }
  content += "</table>";
  $("#main-container").append(content); // append content to main container
}

// handles the rendering of a form to edit/delete a single developer
function fetchSingleDeveloper(index) {
  $("#main-container").empty(); // clear current main content
  $form = $("<form></form>");
  $form.append(
    '<input type="hidden" name="id" value="' + developers[index].id + '">'
  );
  $form.append(
    '<div class="form-group"><label for="name">Name</label><input name="name" type="text" class="form-control" value="' +
      developers[index].name +
      '" required></div>'
  );
  $form.append(
    '<div class="form-group"><label for="bio">Bio</label><textarea name="bio" class="form-control" required>' +
      developers[index].bio +
      "</textarea></div>"
  );
  $form.append(
    '<div class="form-group"><label for="price">Price</label><input name="price" type="number" class="form-control" value="' +
      developers[index].price +
      '" min="0" step="0.01" max="200" required></div>'
  );
  $form.append(
    '<div class="form-group form-btns"><button name="delete"  class="btn btn-dark" onclick="deleteDeveloper(' +
      index +
      ')">Delete</button><button name="update"   class="btn btn-dark" onclick="updateDeveloper(' +
      index +
      ')">Update</button></div>'
  );
  $form.submit(function (e) {
    // prevents standard form redirect action
    return false;
  });
  $("#main-container").append($form); // appends content to main container
}

// handles the AJAX request for deleting a developer
async function deleteDeveloper(index) {
  if (
    confirm(
      "Are you sure you wish to delete this developer? This action is irreversible."
    )
  ) {
    const request = new Request(
      "/api/developers/" + developers[index].id + "/",

      {
        headers: { "X-CSRFToken": csrftoken },
      }
    );
    fetch(request, {
      method: "DELETE",
      mode: "same-origin",
    }).then(async function (response) {
      alert("Developer deleted.");
      await updateDevelopers(); // update developers state
      $("#main-container").empty(); // clear current main content
      updateDevTable();
    });
  }
}

// handles the AJAX request for updating a developer
async function updateDeveloper(index) {
  let form_data = $("form").serializeArray();
  if (
    form_data[1].value == "" ||
    form_data[2].value == "" ||
    form_data[3] < 0 ||
    form_data[3] > 200
  ) {
    // form validation as default form submit actions are prevented
    return;
  }
  let data = {
    id: form_data[0].value,
    name: form_data[1].value,
    bio: form_data[2].value,
    price: form_data[3].value,
  };
  if (
    confirm(
      "Are you sure you wish to update this developer? This action is irreversible."
    )
  ) {
    const request = new Request(
      "/api/developers/" + developers[index].id + "/",

      {
        // generate fetch request
        headers: {
          "X-CSRFToken": csrftoken,
          "Content-Type": "application/json",
        },
      }
    );
    fetch(request, {
      // call fetch request
      method: "PUT",
      mode: "same-origin",
      body: JSON.stringify(data),
    }).then(async function (response) {
      alert("Developer updated.");
      await updateDevelopers(); // update developers state
      $("#main-container").empty(); // clear current main content
      fetchSingleDeveloper(index); // rerender edited developer screen
    });
  }
}

// handles the AJAX request for adding a new developer
function addDeveloper() {
  let form_data = $("form").serializeArray();
  if (
    form_data[1].value == "" ||
    form_data[2].value == "" ||
    form_data[3] < 0 ||
    form_data[3] > 200
  ) {
    // form validation as default form submit actions are prevented
    return;
  }
  let data = {
    name: form_data[0].value,
    bio: form_data[1].value,
    price: form_data[2].value,
  };
  if (confirm("Are you sure you wish to add this developer?")) {
    const request = new Request("/api/developers/", {
      // generate fetch request
      headers: {
        "X-CSRFToken": csrftoken,
        "Content-Type": "application/json",
      },
    });
    fetch(request, {
      // execute fetch request
      method: "POST",
      mode: "same-origin",
      body: JSON.stringify(data),
    }).then(async function (response) {
      alert("Developer added.");
      await updateDevelopers(); // update developers state
      $("#main-container").empty(); // clear current main content
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
  $("#main-container").empty(); // clear current main content
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
  $form.submit(function (e) {
    // prevent form default action
    return false;
  });
  $("#main-container").append($form); // render form
});

/**
 * The following functions handle all reactive components related to projects
 */

//handles updating the local project state object
async function updateProjects() {
  await $.ajax({
    type: "GET",
    url: "/api/projects/",
    dataType: "json",
    success: function (response) {
      projects = response.projects;
    },
    error: function (err) {
      console.log("err: ", err);
    },
  });
}

//handles rendering the table that displays all project elements in the database
function updateProjectsTable() {
  $("#main-container").empty(); // clear current main content
  let content = "<table>"; // init content to render
  for (i = 0; i < projects.length; i++) {
    content +=
      '<tr><td><button type="button" class="btn btn-dark tbl-btn" onclick="fetchSingleProject(' +
      i +
      ')">' +
      projects[i].title +
      "</button></td></tr>"; // generate table
  }
  content += "</table>";
  $("#main-container").append(content); // append content to main container
}

// handles the rendering of a form to edit/delete a single project
function fetchSingleProject(index) {
  $("#main-container").empty(); // clear current main content
  $form = $("<form></form>");
  $form.append(
    '<input type="hidden" name="id" value="' + projects[index].id + '">'
  );
  $form.append(
    '<div class="form-group"><label for="title">Title</label><input name="title" type="text" class="form-control" value="' +
      projects[index].title +
      '" required></div>'
  );
  if (developers.length > 0) {
    // construct developers view
    let html =
      '<div class="form-group"><label for="developers">Developers</label><select name="developers" class="form-control" multiple>';
    for (let i = 0; i < developers.length; i++) { // loop through all developers 
      let selected = false; 
      for (let a = 0; a < projects[index].developers.length; a++) { // loop through all developers on this project
        if (projects[index].developers[a].id === developers[i].id) { // if the top loop developer is on this project
          selected = true; // flags that this developer should begin selected
        }
      }
      //construct select option
      if (selected) {
        html +=
          '<option value="' +
          developers[i].id +
          '" selected>' +
          developers[i].name +
          "</option>";
      } else {
        html +=
          '<option value="' +
          developers[i].id +
          '">' +
          developers[i].name +
          "</option>";
      }
    }
    html += "</select></div>";
    $form.append(html);
  } else {
    $form.append(
      '<div class="form-group"><label for="developers">Developers</label><p>No developers</p></div>'
    );
  }
  $form.append(
    '<div class="form-group"><label for="budget">Budget</label><input name="budget" type="number" class="form-control" value="' +
      projects[index].budget +
      '" min="0" step="0.01" max="1000000" required></div>'
  );
  $form.append(
    '<div class="form-group form-btns"><button name="delete"  class="btn btn-dark" onclick="deleteProject(' +
      index +
      ')">Delete</button><button name="update"   class="btn btn-dark" onclick="updateProject(' +
      index +
      ')">Update</button></div>'
  );
  $form.submit(function (e) {
    // prevents standard form redirect action
    return false;
  });
  $("#main-container").append($form); // appends content to main container
}

// handles the AJAX request for deleting a project
async function deleteProject(index) {
  if (
    confirm(
      "Are you sure you wish to delete this project? This action is irreversible."
    )
  ) {
    const request = new Request("/api/projects/" + projects[index].id + "/", {
      headers: { "X-CSRFToken": csrftoken },
    });
    fetch(request, {
      method: "DELETE",
      mode: "same-origin",
    }).then(async function (response) {
      alert("Project deleted.");
      await updateProjects(); // update projects state
      $("#main-container").empty(); // clear current main content
      updateProjectsTable();
    });
  }
}

// handles the AJAX request for updating a project
async function updateProject(index) {
  let form_data = $("form").serializeArray();
  if (form_data[1].value == "" || form_data[2].value == "") {
    // form validation as default form submit actions are prevented
    return;
  }
  let projectDevelopers = []; // construct developers JSON array
  for (i = 2; i < form_data.length - 1; i++) {
    projectDevelopers.push(form_data[i].value);
  }
  let data = { // construct JSON data
    id: form_data[0].value,
    title: form_data[1].value,
    developers: projectDevelopers,
    budget: form_data[form_data.length - 1].value,
  };

  if (
    confirm(
      "Are you sure you wish to update this project? This action is irreversible."
    )
  ) {
    const request = new Request("/api/projects/" + projects[index].id + "/", {
      // generate fetch request
      headers: {
        "X-CSRFToken": csrftoken,
        "Content-Type": "application/json",
      },
    });
    fetch(request, {
      // call fetch request
      method: "PUT",
      mode: "same-origin",
      body: JSON.stringify(data),
    }).then(async function (response) {
      alert("Project updated.");
      await updateProjects(); // update projects state
      $("#main-container").empty(); // clear current main content
      fetchSingleProject(index); // rerender edited project screen
    });
  }
}

// handles the AJAX request for adding a new project
function addProject() {
  let form_data = $("form").serializeArray();
  if (
    form_data[1].value == "" ||
    form_data[2].value == "" ||
    form_data[3] < 0 ||
    form_data[3] > 200
  ) {
    // form validation as default form submit actions are prevented
    return;
  }
  let data = {
    name: form_data[0].value,
    bio: form_data[1].value,
    price: form_data[2].value,
  };
  if (confirm("Are you sure you wish to add this project?")) {
    const request = new Request("/api/projects/", {
      // generate fetch request
      headers: {
        "X-CSRFToken": csrftoken,
        "Content-Type": "application/json",
      },
    });
    fetch(request, {
      // execute fetch request
      method: "POST",
      mode: "same-origin",
      body: JSON.stringify(data),
    }).then(async function (response) {
      alert("Project added.");
      await updateProjects(); // update projects state
      $("#main-container").empty(); // clear current main content
      updateProjectsTable(); // rerender project table
    });
  }
}

// event listener for the fetch projects button
$("#fetch_proj_btn").click(async function (e) {
  await updateProjects(); // update projects state
  updateProjectsTable(); // render project table
});

// event listener for the add project button
$("#add_proj_btn").click(async function (e) {
  $("#main-container").empty(); // clear current main content
  $form = $("<form></form>"); // construct add project form
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
    '<div class="form-group form-btns"><button name="delete"  class="btn btn-dark" onclick="addProject()">Add</button></div>'
  );
  $form.submit(function (e) {
    // prevent form default action
    return false;
  });
  $("#main-container").append($form); // render form
});

$(document).ready(function () {
  //Initialise state
  updateDevelopers();
  updateProjects();
});
