if (!customElements.get("swiper-slider")) {
  class SwiperSlider extends HTMLElement {
    constructor() {
      super();
      this.slideContainer = this.querySelector(".swiper");
      this.slides = this.querySelectorAll(".swiper-slide");
      this.sliderOptions = this.applyDefaultOptions(this.getSliderOptions());
      this.activeIndex = 0;
      this.initialized = false;
      if (this.dataset.customEvent) {
        this.attachCustomListeners(this.dataset.customEvent);
      }
      if (this.slideContainer && this.slides.length > 0) {
        document.addEventListener(
          "DOMContentLoaded",
          this.initializeSwiper.bind(this)
        );
        document.addEventListener(
          "shopify:section:load",
          this.initializeSwiper.bind(this)
        );
        window.addEventListener("resize", this.handleResize.bind(this));
        this.addEventListener("update-slides", this.updateSlides.bind(this));
        this.addEventListener("go-to-slide", this.goToSlide.bind(this));
      } else {
        console.warn("SwiperSlider - Slider or Slides Not Found");
      }
    }

    updateSlides(evt) {
      this.slider.appendSlide(evt.detail.slides);
      this.goToSlide(evt);
      this.slider.update();
    }

    goToSlide(evt) {
      let index = evt.detail.index;
      if (!index && evt.detail.position) {
        const elm = this.querySelector(
          "[data-position='" + evt.detail.position + "']"
        );
        index = [...elm.parentNode.children].indexOf(elm);
      }
      if (index != 0 && !index) return;
      this.slider.slideTo(index);
    }

    applyDefaultOptions(options) {
      if (options.loop === undefined) {
        options.loop = true;
      }
      options.speed = 400;
      return options;
    }

    getSliderOptions() {
      try {
        let options = JSON.parse(this.dataset.swiperOptions);
        let bullets = this.dataset.swiperBullets;
        if (bullets) {
          bullets = bullets.split(",");
          options.pagination.renderBullet = function (index, className) {
            return (
              '<p class="swiper-pagination-bullet--text ' +
              className +
              '">' +
              bullets[index] +
              "</p>"
            );
          };
        }
        return options;
      } catch (err) {
        console.log(err);
        return {};
      }
    }

    initializeSwiper() {
      if (window.Swiper && !this.initialized) {
        this.initialized = true;
        this.slider = new Swiper(this.slideContainer, this.sliderOptions);
        this.initializeSliderEventListeners();
      } else if (!window.Swiper) {
        console.warn("SwiperSlider - Swiper.js not found");
      }
    }

    handleResize(e) {
      if (this.slider) {
        setTimeout(() => {
          this.slider.updateSize();
        }, 300);
      }
    }
    initializeSliderEventListeners() {}
  }
  customElements.define("swiper-slider", SwiperSlider);
}

class SwiperTabSlider extends SwiperSlider {
  constructor() {
    super();
    this.tabs = this.querySelectorAll(".glide__nav-item");
    if (this.tabs.length > 0) {
      this.tabs.forEach((tab) => {
        tab.addEventListener("click", this.goToSlide.bind(this, tab));
      });
    }
  }
  goToSlide(tab) {
    try {
      const tabIndex = tab.dataset.newIndex;
      if (tabIndex) {
        this.slider.slideTo(tabIndex);
      } else {
        console.warn("newIndex not provided for Tab Slider Tab");
      }
    } catch (err) {
      console.warn(err);
    }
  }
}

customElements.define("swiper-tab-slider", SwiperTabSlider);
