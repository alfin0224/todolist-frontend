<template>
  <div class="content">
    <div class="container-fluid">
      <div class="row">
        <div class="col-xl-3 col-md-6">
          <stats-card>
            <div slot="header" class="icon-primary">
              <i class="fa fa-tasks text-primary"></i>
            </div>
            <div slot="content">
              <p class="card-category">Total Task</p>
              <h4 class="card-title">{{ totalTasks }}</h4>
            </div>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card>
            <div slot="header" class="icon-success">
              <i class="fa fa-tasks text-success"></i>
            </div>
            <div slot="content">
              <p class="card-category">Completed Task</p>
              <h4 class="card-title">{{ completedTaskCount }}</h4>
            </div>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card>
            <div slot="header" class="icon-warning">
              <i class="fa fa-tasks text-warning"></i>
            </div>
            <div slot="content">
              <p class="card-category">Pending Task</p>
              <h4 class="card-title">{{ pendingTaskCount }}</h4>
            </div>
          </stats-card>
        </div>

        <div class="col-xl-3 col-md-6">
          <stats-card>
            <div slot="header" class="icon-danger">
              <i class="fa fa-tasks text-danger"></i>
            </div>
            <div slot="content">
              <p class="card-category">Upcoming Deadlines</p>
              <h4 class="card-title">{{ upcomingDeadlineCount }}</h4>
            </div>
          </stats-card>
        </div>
      </div>

      <div class="row">
        <div class="col-md-8">
          <card class="strpied-tabled-with-hover">
            <template slot="header">
              <h4 class="card-title">Upcoming Deadlines (Less than 1 day):</h4>
            </template>
            <table class="table table-striped table-bordered">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Title</th>
                  <th scope="col">Due Date</th>
                  <th scope="col">Reminder Status</th>
                  <th scope="col">Reminder Date</th>
                  <!-- <th scope="col">Actions</th> -->
                </tr>
              </thead>
              <tbody>
                <tr v-for="(task, index) in upcomingDeadlines" :key="task._id">
                  <th scope="row">{{ index + 1 }}</th>
                  <td>{{ task.title }}</td>
                  <td class="text-danger">{{ task.due_date }}</td>
                  <td>{{ task.reminder_status ? "Done" : "Not Yet" }}</td>
                  <td>{{ task.reminder_date ? task.reminder_date : "Null"  }}</td>
                  <!-- <td>
                    <button
                      @click="sendReminderEmail(task._id)"
                      class="btn btn-primary btn-sm"
                    >
                      <i class="fa fa-send-o"></i>
                    </button>
                  </td> -->
                </tr>
              </tbody>
            </table>
          </card>
        </div>

        <!-- <div class="col-md-4">
          <chart-card :chart-data="pieChart.data" chart-type="Pie">
            <template slot="header">
              <h4 class="card-title">Task</h4>
            </template>
            <template slot="footer">
              <div class="legend">
                <i class="fa fa-circle text-info"></i> Total
                <i class="fa fa-circle text-danger"></i> Completed
                <i class="fa fa-circle text-warning"></i> Pending
                <i class="fa fa-circle" style="color: #6f42c1"></i> Upcoming Deadline
              </div>
              <hr />
            </template>
          </chart-card>
        </div> -->

        <div class="col-md-4">
          <card>
            <template slot="header">
              <h5 class="title">All Tasks</h5>
            </template>
            <l-table :data="tableData.data" :columns="tableData.columns">
              <template slot="columns"></template>

              <template slot-scope="{ row }">
                <td>
                  <base-checkbox v-model="row.checked"></base-checkbox>
                </td>
                <td>{{ row.title }}</td>
              </template>
            </l-table>
            <div class="footer">
              <hr />
              <div class="stats">

              </div>
            </div>
          </card>
        </div>

      </div>
    </div>
  </div>
</template>
<script>
import ChartCard from "src/components/Cards/ChartCard.vue";
import StatsCard from "src/components/Cards/StatsCard.vue";
import LTable from "src/components/Table.vue";
import axios from "axios";
import Swal from "sweetalert2";

export default {
  components: {
    LTable,
    ChartCard,
    StatsCard,
  },
  data() {
    return {
      editTooltip: "Edit Task",
      deleteTooltip: "Remove",
      completedTasks: [],
      upcomingDeadlines: [],
      totalTasks: 0,
      completedTaskCount: 0,
      pendingTaskCount: 0,
      upcomingDeadlineCount: 0,
      pieChart: {
        data: {
          labels: ["Total", "Completed", "Pending", "Upcoming"],
          series: [0, 0, 0, 0],
        },
      },
      tableData: {
        data: []
      },
    };
  },
  created() {
    this.fetchCompletedTasks();
    this.fetchUpcomingDeadlines();
    this.fetchSummary();
    this.fetchTasks();
  },
  methods: {
    async sendReminderEmail(taskId) {
      try {
        await axios.post(
          `http://localhost:8000/api/tasks/${taskId}/send-manual-reminder`
        );
        
        Swal.fire("Success", "Reminder email sent!", "success");
      } catch (error) {
        console.error("Error sending reminder email:", error);
      }
    },

    async fetchSummary() {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/tasks-summary"
        );
        this.summary = response.data;
        this.totalTasks = response.data.total_tasks;
        this.completedTaskCount = response.data.completed_tasks;
        this.pendingTaskCount = response.data.pending_tasks;
        this.upcomingDeadlineCount = response.data.upcoming_deadline;

        this.pieChart.data.series = [
          this.totalTasks,
          this.completedTaskCount,
          this.pendingTaskCount,
          this.upcomingDeadlineCount,
        ];
      } catch (error) {
        console.error("Error fetching tasks summary:", error);
      }
    },

    async fetchTasks() {
      try {
        const response = await axios.get("http://localhost:8000/api/tasks/");
        this.tasks = response.data;
        console.log(response.data);

        this.tableData.data = response.data.map((task) => ({
          title: task.title,
          checked: task.completed,
        }));
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    },

    async fetchCompletedTasks() {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/completed-tasks"
        );
        this.completedTasks = response.data;
      } catch (error) {
        console.error("Error fetching completed tasks:", error);
      }
    },
    async fetchUpcomingDeadlines() {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/upcoming-deadlines"
        );
        this.upcomingDeadlines = response.data;
      } catch (error) {
        console.error("Error fetching upcoming deadlines:", error);
      }
    },
  },
};
</script>
<style></style>
