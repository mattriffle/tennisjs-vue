import { createApp } from "vue";
import * as bootstrap from "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./scss/custom.scss";
import "./assets/main.css";
import App from "./App.vue";

const app = createApp(App);

app.directive("popover", {
  mounted(el, binding) {
    const options = {
      trigger: "hover",
      html: true,
      ...binding.value,
    };
    new bootstrap.Popover(el, options);
  },
  updated(el, binding) {
    const popover = bootstrap.Popover.getInstance(el);
    if (popover) {
      popover.setContent({
        ".popover-body": binding.value.content,
      });
    }
  },
});

app.mount("#app");
