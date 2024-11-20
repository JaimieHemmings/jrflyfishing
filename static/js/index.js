class Carousel {
  constructor(element) {
      this.container = element;
      this.track = element.querySelector('.carousel-track');
      this.items = element.querySelectorAll('.carousel-item');
      
      this.currentIndex = 0;
      this.itemsPerView = window.innerWidth <= 768 ? 1 : 2;
      this.totalSlides = Math.ceil(this.items.length - 1);

      // Dragging state
      this.isDragging = false;
      this.startPos = 0;
      this.currentTranslate = 0;
      this.prevTranslate = 0;
      this.animationID = 0;

      this.initDragging();
      this.initAutoScroll();
      this.initResponsive();
  }

  initDragging() {
      // Mouse events
      this.track.addEventListener('mousedown', this.dragStart.bind(this));
      window.addEventListener('mousemove', this.drag.bind(this));
      window.addEventListener('mouseup', this.dragEnd.bind(this));

      // Touch events
      this.track.addEventListener('touchstart', this.dragStart.bind(this));
      window.addEventListener('touchmove', this.drag.bind(this));
      window.addEventListener('touchend', this.dragEnd.bind(this));

      // Prevent context menu
      this.container.addEventListener('contextmenu', e => e.preventDefault());
  }

  dragStart(e) {
      if (e.type === 'mousedown') {
          this.startPos = e.clientX;
      } else {
          this.startPos = e.touches[0].clientX;
      }

      this.isDragging = true;
      this.animationID = requestAnimationFrame(this.animation.bind(this));
      this.container.classList.add('dragging');
      this.track.classList.add('dragging');

      // Clear auto scroll when user starts dragging
      clearInterval(this.autoScrollInterval);
  }

  drag(e) {
      if (!this.isDragging) return;

      const currentPosition = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
      const diff = currentPosition - this.startPos;
      this.currentTranslate = this.prevTranslate + diff;
  }

  dragEnd() {
      this.isDragging = false;
      cancelAnimationFrame(this.animationID);
      this.container.classList.remove('dragging');
      this.track.classList.remove('dragging');

      const movedBy = this.currentTranslate - this.prevTranslate;

      // If moved enough negative, move to next slide if exists
      if (movedBy < -100 && this.currentIndex < this.totalSlides - 1) {
          this.currentIndex++;
      }
      // If moved enough positive, move to previous slide if exists
      else if (movedBy > 100 && this.currentIndex > 0) {
          this.currentIndex--;
      }

      this.setPositionByIndex();
      this.initAutoScroll(); // Restart auto scroll after drag
  }

  animation() {
      if (this.isDragging) {
          this.setSliderPosition();
          requestAnimationFrame(this.animation.bind(this));
      }
  }

  setSliderPosition() {
      // Limit the drag to prevent dragging too far
      const maxTranslate = 0;
      const minTranslate = -(this.totalSlides - 1) * (this.container.clientWidth / this.itemsPerView);
      
      this.currentTranslate = Math.max(Math.min(this.currentTranslate, maxTranslate), minTranslate);
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  setPositionByIndex() {
      this.currentTranslate = -(this.currentIndex * (this.container.clientWidth / this.itemsPerView));
      this.prevTranslate = this.currentTranslate;
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  initAutoScroll() {
      // Clear any existing interval
      if (this.autoScrollInterval) {
          clearInterval(this.autoScrollInterval);
      }

      this.autoScrollInterval = setInterval(() => {
          if (this.currentIndex === this.totalSlides - 1) {
              this.currentIndex = 0;
          } else {
              this.currentIndex++;
          }
          this.setPositionByIndex();
      }, 5000);
  }

  initResponsive() {
      window.addEventListener('resize', () => {
          const newItemsPerView = window.innerWidth <= 768 ? 1 : 2;
          if (newItemsPerView !== this.itemsPerView) {
              this.itemsPerView = newItemsPerView;
              this.totalSlides = Math.ceil(this.items.length / this.itemsPerView);
              this.currentIndex = Math.min(this.currentIndex, this.totalSlides - 1);
              this.setPositionByIndex();
          }
      });
  }
}

// Initialize the carousel
document.addEventListener('DOMContentLoaded', () => {
  const carousel = new Carousel(document.querySelector('.carousel-container'));
});