<template>
  <div class="content">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="form-group mb-3">
            <button
              @click="toggleAddNewTask"
              class="btn btn-md btn-success mt-2"
            >
              Add Task
            </button>
          </div>
        </div>
        <div v-if="addNewTask" class="col-12">
          <card class="strpied-tabled-with-hover">
            <template slot="header">
              <h4 class="card-title">Add New Task</h4>
            </template>
            <form @submit.prevent="addTask" class="mb-4">
              <div class="form-group mb-3">
                <input
                  type="email"
                  v-model="newTask.email"
                  class="form-control"
                  placeholder="Write email in here..."
                  required
                />
              </div>
              <div class="form-group mb-3">
                <input
                  v-model="newTask.title"
                  class="form-control"
                  placeholder="Write new task title in here..."
                  required
                />
              </div>
              <div class="form-group mb-3">
                <textarea
                  v-model="newTask.description"
                  class="form-control"
                  placeholder="Write new task description in here..."
                  required
                >
                </textarea>
              </div>
              <div class="form-group mb-3">
                <input
                  type="datetime-local"
                  v-model="newTask.due_date"
                  class="form-control"
                  required
                />
              </div>
              <div class="form-group mb-3">
                <button type="submit" class="btn btn-sm btn-primary m-1">
                  Save New Task
                </button>
                <button
                  @click="toggleAddNewTask"
                  class="btn btn-sm btn-secondary m-1"
                >
                  Close Form
                </button>
              </div>
            </form>
          </card>
        </div>
        <div class="col-12">
          <card
            class="strpied-tabled-with-hover"
            body-classes="table-full-width table-responsive"
          >
            <template slot="header">
              <h4 class="card-title">Todo List</h4>
            </template>
            <table class="table table-hover table-striped table-bordered">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Email</th>
                  <th scope="col">Title</th>
                  <th scope="col">Description</th>
                  <th scope="col">Due Date</th>
                  <th scope="col">Completed</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(task, index) in tasks" :key="task._id">
                  <th scope="row">{{ index + 1 }}</th>
                  <td>{{ task.email }}</td>
                  <td>{{ task.title }}</td>
                  <td>{{ task.description }}</td>
                  <td>{{ task.due_date }}</td>
                  <td>{{ task.completed ? "Yes" : "No" }}</td>
                  <td>
                    <button
                      @click="editTask(task)"
                      class="btn btn-secondary btn-sm m-1"
                    >
                      <i class="fa fa-edit"></i>
                    </button>
                    <button
                      @click="confirmDelete(task._id)"
                      class="btn btn-danger btn-sm m-1"
                    >
                      <i class="fa fa-trash"></i>
                    </button>
                    <button
                      @click="confirmMarkAsCompleted(task)"
                      class="btn btn-success btn-sm m-1"
                      v-if="!task.completed"
                    >
                      <i class="fa fa-check"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </card>
        </div>

        <!-- Edit Form -->
        <div class="col-12">
          <div v-if="editingTask">
            <card class="strpied-tabled-with-hover">
              <template slot="header">
                <h4 class="card-title">Edit Task</h4>
              </template>
              <form @submit.prevent="updateTask">
                <div class="form-group mb-3">
                  <input
                    v-model="editedTask.email"
                    type="email"
                    class="form-control"
                    id="editEmail"
                    required
                  />
                </div>
                <div class="form-group mb-3">
                  <input
                    v-model="editedTask.title"
                    type="text"
                    class="form-control"
                    id="editTitle"
                    required
                  />
                </div>
                <div class="form-group mb-3">
                  <textarea
                    v-model="editedTask.description"
                    class="form-control"
                    required
                  >
                  </textarea>
                </div>
                <div class="form-group mb-3">
                  <input
                    type="datetime-local"
                    v-model="editedTask.due_date"
                    class="form-control"
                    required
                  />
                </div>
                <div class="form-group mb-3">
                  <button type="submit" class="btn btn-primary m-1">
                    Update
                  </button>
                  <button
                    @click="cancelEdit"
                    type="button"
                    class="btn btn-secondary m-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Card from "src/components/Cards/Card.vue";
import axios from "axios";
import Swal from "sweetalert2";
export default {
  components: {
    Card,
  },
  data() {
    return {
      tasks: [],
      addNewTask: false,
      newTask: {
        email: "",
        title: "",
        description: "",
        due_date: null,
        completed: false,
        email_remainder: false,
        reminder_date: null,
      },
      editingTask: null,
      editedTask: {
        _id: "",
        email: "",
        title: "",
        description: "",
        due_date: "",
      },
    };
  },
  mounted() {
    this.fetchTasks();
  },
  methods: {
    toggleAddNewTask() {
      this.addNewTask = !this.addNewTask;
    },
    async confirmMarkAsCompleted(task) {
      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        text: "This task will be marked as completed.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, mark as completed!",
      });

      if (confirmResult.isConfirmed) {
        this.markAsCompleted(task);
      }
    },
    async markAsCompleted(task) {
      try {
        await axios.put(`http://localhost:8000/api/tasks/${task._id}`, {
          completed: true,
        });
        this.fetchTasks();
        Swal.fire("Success", "Task marked as completed!", "success");
      } catch (error) {
        console.error("Error marking task as completed:", error);
      }
    },
    async fetchTasks() {
      try {
        const response = await axios.get("http://localhost:8000/api/tasks/");
        this.tasks = response.data;
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    },
    async addTask() {
      this.addNewTask;
      try {
        await axios.post("http://localhost:8000/api/tasks/", this.newTask);
        this.newTask.email = "";
        this.newTask.title = "";
        this.newTask.description = "";
        this.newTask.due_date = null;
        this.fetchTasks();
        Swal.fire("Success", "Task added successfully!", "success");
      } catch (error) {
        console.error("Error adding task:", error);
      }
    },

    editTask(task) {
      this.editingTask = task;
      this.editedTask = { ...task };
    },
    async updateTask() {
      try {
        await axios.put(
          `http://localhost:8000/api/tasks/${this.editedTask._id}`,
          this.editedTask
        );
        this.fetchTasks();
        this.cancelEdit();
        Swal.fire("Success", "Task updated successfully!", "success");
      } catch (error) {
        console.error("Error updating task:", error);
      }
    },
    cancelEdit() {
      this.editingTask = null;
      this.editedTask = { _id: "", title: "" };
    },

    async deleteTask(taskId) {
      try {
        await axios.delete(`http://localhost:8000/api/tasks/${taskId}`);
        this.fetchTasks();
        Swal.fire("Success", "Task deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },

    async confirmDelete(taskId) {
      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        text: "You will not be able to recover this task!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (confirmResult.isConfirmed) {
        this.deleteTask(taskId);
      }
    },
  },
};
</script>
<style></style>
