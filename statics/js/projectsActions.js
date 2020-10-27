let projects = []; //local state to track projects

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
function fetchSingleProject(i) {
  $("#main-container").empty(); // clear current main content
  $form = $("<form></form>");
  $form.append(
    '<input type="hidden" name="id" value="' + projects[i].id + '">'
  );
  $form.append(
    '<div class="form-group"><label for="title">Name</label><input name="title" type="text" class="form-control" value="' +
      projects[i].title +
      '" required></div>'
  );
  //TODO render developers
  $form.append(
    '<div class="form-group"><label for="budget">Budget</label><input name="budget" type="number" class="form-control" value="' +
      projects[i].budget +
      '" min="0" step="0.01" max="1000000" required></div>'
  );
  $form.append(
    '<div class="form-group form-btns"><button name="delete"  class="btn btn-dark" onclick="deleteProject(' +
      i +
      ')">Delete</button><button name="update"   class="btn btn-dark" onclick="updateProject(' +
      i +
      ')">Update</button></div>'
  );
  $form.submit(function (e) {
    // prevents standard form redirect action
    return false;
  });
  $("#main-container").append($form); // appends content to main container
}

// handles the AJAX request for deleting a project
async function deleteProject(i) {
  if (
    confirm(
      "Are you sure you wish to delete this project? This action is irreversible."
    )
  ) {
    const request = new Request("/api/projects/" + projects[i].id + "/", {
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
async function updateProject(i) {
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
      "Are you sure you wish to update this project? This action is irreversible."
    )
  ) {
    const request = new Request("/api/projects/" + projects[i].id + "/", {
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
      fetchSingleProject(i); // rerender edited project screen
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
