<template>
  <div>
    <div
      class="card col-sm-11 mr-auto ml-auto mt-2 body-background window"
      style="height: 90px"
    >
      <div class="card-header row">
        <div class="ml-auto">
          <a class="mr-4" @click="createFolder()"
            >
            <span>Create</span><font-awesome-icon icon="plus"></font-awesome-icon
          ></a>
          <a
            ><label class="custom-file-upload">
              <input type="file" id="file" @input="uploadFile()" />
              <span>Upload</span>
              <font-awesome-icon icon="upload"></font-awesome-icon> </label
          ></a>
        </div>
      </div>
      <div class="table text">
        <table v-if="true" style="width: 100%">
          <thead>
            <td></td>
            <th style="column-width;30%">Name</th>
            <th>Date Modified</th>
            <th>Type</th>
            <th>Size</th>
            <th>Actions</th>
          </thead>
          <colgroup>
            <col span="1" style="width: 1%" />
            <col span="1" style="width: 50%" />
            <col span="1" style="width: 15%" />
            <col span="1" style="width: 15%" />
            <col span="1" style="width: 10%" />
            <col span="1" style="width: 5%" />
          </colgroup>
          <tbody>
            <tr
              v-for="folder in this.folders"
              :key="folder.name"
              style="text-align: left"
            >
              <td>
                <font-awesome-icon
                  icon="folder-open"
                  style="color: #f5df1b; font-size: 20px"
                />
              </td>
              <td @click="openFolder(folder.name)">
                <!-- <span
                  v-if="
                    newlyCreated !== undefined &&
                    newlyCreated.indexOf(folder.folderName) === -1
                  "
                  class="folder"
                  >{{ folder.folderName }}</span
                >
                <span
                  :id="folder.folderName"
                  contentEditable="true"
                  v-if="
                    newlyCreated !== undefined &&
                    newlyCreated.indexOf(folder.folderName) > -1
                  "
                  style="display: inline-block"
                  @click="
                    (e) => {
                      e.stopPropagation();
                    }
                  "
                  @focusout="saveFolder(folder.folderName)"
                  >{{ folder.folderName }}
                </span> -->
                <span>{{ folder.name }}</span>
              </td>
              <td>Created Date</td>
              <td>File Folder</td>
              <td></td>
              <td>Button</td>
            </tr>
            <tr
              v-for="(file, index) in this.files"
              :key="file.fileName"
              style="text-align: left"
            >
              <td>
                <font-awesome-icon
                  icon="file"
                  style="color: #5656f9; font-size: 20px"
                />
              </td>
              <td :id="file.fileName">
                <a v-bind:href="file.fileURL" target="_blank"
                  ><span class="folder">{{ file.fileName }}</span></a
                >
              </td>
              <td>{{ file.path }}</td>
              <td>File</td>
              <td>{{ bytesToSize(file.fileSize) }}</td>
              <td>
                <div class="relative">
                  <button
                    class="flex items-center justify-between px-3 bg-white w-full no-border rounded-lg"
                    @click="openMenu(file.fileGUID, 'file')"
                  >
                    <span
                      ><font-awesome-icon
                        icon="ellipsis-v"
                        class="text-muted"
                      ></font-awesome-icon
                    ></span>
                  </button>
                  <transition
                    enter-active-class="transform transition duration-500 ease-custom"
                    enter-class="-translate-y-1/2 scale-y-0 opacity-0"
                    enter-to-class="translate-y-0 scale-y-100 opacity-100"
                    leave-active-class="transform transition duration-300 ease-custom"
                    leave-class="translate-y-0 scale-y-100 opacity-100"
                    leave-to-class="-translate-y-1/2 scale-y-0 opacity-0"
                  >
                    <ul
                      :id="file.fileGUID"
                      class="absolute left-0 right-0 mb-4 w-48 bg-white divide-y rounded-lg shadow-lg overflow-hidden closed"
                    >
                      <li
                        class="px-3 py-2 transition-colors duration-300 hover:bg-gray-200 pointer"
                      >
                        Rename
                      </li>
                      <li
                        class="px-3 py-2 transition-colors duration-300 hover:bg-gray-200 pointer"
                        @click="openDeleteModal(file.fileGUID, 'file')"
                      >
                        Delete
                      </li>
                      <li
                        class="px-3 py-2 transition-colors duration-300 hover:bg-gray-200 pointer"
                        @click="openModal(index, 'file')"
                      >
                        Copy
                      </li>
                      <li
                        class="px-3 py-2 transition-colors duration-300 hover:bg-gray-200 pointer"
                        @click="move(file.fileGUID, 'file')"
                      >
                        Move
                      </li>
                    </ul>
                  </transition>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="mt-4" v-if="this.isNewUser">
          <p class="text-muted" style="font-size: 24px">
            Welcome to your personal file manager! Create a folder to get
            started.
          </p>
        </div>
      </div>
    </div>
    <!-- <modal name="copy" :width="this.modalWidth" :height="this.modalHeight">
      <Copy
        :foldersForUser="this.folders"
        :type="this.selectedType"
        :operation="'copy'"
      />
    </modal>
    <modal name="move" :width="this.modalWidth" :height="this.modalHeight">
      <Copy
        :foldersForUser="this.folders"
        :type="this.selectedType"
        :operation="'move'"
      />
    </modal>
    <modal
      name="delete"
      :width="this.modalWidth * 0.5"
      :height="this.modalHeight * 0.35"
    >
      <div
        class="row mt-4 mr-2 ml-2 d-flex justify-content-center"
        style="margin-bottom: -15px"
      >
        <p class="text-muted">
          Are you sure you want to <span class="text-danger">DELETE</span> this
          {{ this.selectedType }}
          <span v-if="this.selectedType === 'folder'"> and its contents?</span>
        </p>
      </div>
      <p style="font-size: 14px">This action cannot be reversed!</p>
      <p style="margin-top: -14px" v-if="this.selectedType === 'folder'">
        {{ this.selectedFolder.folderName }}
      </p>
      <p style="margin-top: -14px" v-if="this.selectedType === 'file'">
        {{ this.selectedFile.fileName }}
      </p>
      <div class="row mr-3 ml-3 d-flex justify-content-end">
        <button class="btn btn-secondary mr-2" @click="cancelDelete()">
          Cancel
        </button>
        <button class="btn btn-danger" @click="deleteFolder()">Delete</button>
      </div>
    </modal> -->
  </div>
</template>

<script>
export default {
  name: "Folder",
  props: {},
  created() {
    fetch(
      "https://localhost:44346/{tenant}/Folder/101/File"
    )
      .then((res) => res.json())
      .then((response) => {
        this.folders.push(response.data);
        console.log(response);
      });
  },
  data() {
    return { folders: [] };
  },
};
</script>

<style>
.ease-custom {
  transition-timing-function: cubic-bezier(0.61, -0.53, 0.43, 1.43);
}
/* */
.body-background {
  background-color: #fdfdfd;
}
.window {
  border: none !important;
}
input[type="file"] {
  display: none;
}
.custom-file-upload {
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
}
.card-header {
  background-color: rgba(0, 0, 0, 0) !important;
}
.text {
  font-size: 14px;
}
.folder {
  cursor: pointer;
  transition: ease-in-out 0.1s;
}
.folder:hover {
  font-size: 15px;
}
.table {
  font-family: dosis;
  font-style: bold;
}
.breadcrumb {
  background-color: transparent !important;
}
.absolute {
  position: absolute;
  list-style-type: none;
  padding: 0 !important;
}
.rotate-180 {
  -moz-transition: all 1s linear !important;
  -webkit-transition: all 1s linear !important;
  transition: all 0.3s linear !important;
  -ms-transform: rotate(180deg) !important;
  -moz-transform: rotate(180deg) !important;
  -webkit-transform: 1s rotate(180deg) !important;
  transform: rotate(180deg);
}
.rotate-0 {
  -moz-transition: all 1s linear !important;
  -webkit-transition: all 1s linear !important;
  transition: all 0.3s linear !important;
  -ms-transform: rotate(180deg) !important;
  -moz-transform: rotate(180deg) !important;
  -webkit-transform: 1s rotate(180deg) !important;
  transform: rotate(0deg);
}
.no-border {
  border: none !important;
}
.open {
  display: block !important;
}
.closed {
  display: none !important;
}
.pointer {
  cursor: pointer;
}
.pointer:hover {
  font-size: 16px;
  transition: ease-in-out 0.1s;
}
span:focus {
  padding: 10px !important;
  outline-color: rgb(58, 159, 255);
}
.vm--modal {
  border-radius: 25px !important;
}

th {
  text-align: start !important;
}
</style>