<template>
  <div>
    <div class="row mb-3">
      <div class="col-sm-6 col-lg-3 col-md-3">
        <div class="card card-inverse card-success ml-3 mr-3">
          <div class="card-block border-success">
            <div class="rotate mt-2">
              <i class="fa fa-user fa-5x"></i>
            </div>
            <h6 class="text-uppercase mt-2">Term 1</h6>
            <h1 class="display-1">134</h1>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3 col-md-3">
        <div class="card card-inverse card-danger ml-3 mr-3">
          <div class="card-block border-danger">
            <div class="rotate mt-2">
              <i class="fa fa-list fa-4x"></i>
            </div>
            <h6 class="text-uppercase">Term 2</h6>
            <h1 class="display-1">87</h1>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3 col-md-3">
        <div class="card card-inverse card-info ml-3 mr-3">
          <div class="card-block border-info">
            <div class="rotate mt-2">
              <i class="fa fa-twitter fa-5x"></i>
            </div>
            <h6 class="text-uppercase">Term 3</h6>
            <h1 class="display-1">125</h1>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3 col-md-3">
        <div class="card card-inverse card-warning ml-3 mr-3">
          <div class="card-block border-warning">
            <div class="rotate mt-2">
              <i class="fa fa-share fa-5x"></i>
            </div>
            <h6 class="text-uppercase">Term 4</h6>
            <h1 class="display-1">36</h1>
          </div>
        </div>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-sm-6 col-lg-3 col-md-3">
        <div class="card card-inverse card-success ml-3 mr-3">
          <div class="card-block border-success">
            <div class="rotate mt-2">
              <i class="fa fa-user fa-5x"></i>
            </div>
            <h6 class="text-uppercase mt-2">Term 1</h6>
            <h1 class="display-1">134</h1>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3 col-md-3">
        <div class="card card-inverse card-danger ml-3 mr-3">
          <div class="card-block border-danger">
            <div class="rotate mt-2">
              <i class="fa fa-list fa-4x"></i>
            </div>
            <h6 class="text-uppercase">Term 2</h6>
            <h1 class="display-1">87</h1>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3 col-md-3">
        <div class="card card-inverse card-info ml-3 mr-3">
          <div class="card-block border-info">
            <div class="rotate mt-2">
              <i class="fa fa-twitter fa-5x"></i>
            </div>
            <h6 class="text-uppercase">Term 3</h6>
            <h1 class="display-1">125</h1>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3 col-md-3">
        <div class="card card-inverse card-warning ml-3 mr-3">
          <div class="card-block border-warning">
            <div class="rotate mt-2">
              <i class="fa fa-share fa-5x"></i>
            </div>
            <h6 class="text-uppercase">Term 4</h6>
            <h1 class="display-1">36</h1>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Dashboard",
  props: {},
};
</script>
<style>
.card,
.card-block {
  border-radius: 15px !important;
  height: 100% !important;
}
.display-1 {
  font-size: 20px !important;
  margin-right: auto;
}
.border-success {
  border-left-color: green;
  border-left-style: solid;
  border-left-width: 10px;
}
.border-danger {
  border-left-color: red;
  border-left-style: solid;
  border-left-width: 10px;
}
.border-info {
  border-left-color: blue;
  border-left-style: solid;
  border-left-width: 10px;
}
.border-warning {
  border-left-color: yellow;
  border-left-style: solid;
  border-left-width: 10px;
}
</style>