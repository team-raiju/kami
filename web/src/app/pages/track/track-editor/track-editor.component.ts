import { Component, computed, ElementRef, HostListener, signal, ViewChild } from "@angular/core";

import { TrackService } from "../../../services/track.service";
import { CoreShapeComponent, NgKonvaEventObject, StageComponent } from "ng2-konva";
import { StageConfig } from "konva/lib/Stage";
import Konva from "konva";
import { LineConfig } from "konva/lib/shapes/Line";

@Component({
  selector: "track-editor",
  templateUrl: "./track-editor.component.html",
  imports: [StageComponent, CoreShapeComponent],
})
export class TrackEditorComponent {
  @ViewChild("container") container!: ElementRef;
  @ViewChild("stage") stage!: StageComponent;
  @ViewChild("bgLayer") bgLayer!: CoreShapeComponent;
  @ViewChild("dataLayer") dataLayer!: CoreShapeComponent;

  width = signal(0);
  height = signal(0);

  public hovering = signal(false);
  public mouseX = signal(0);
  public mouseY = signal(0);
  public stageOffsetX = signal(0);
  public stageOffsetY = signal(0);

  public stageConfig = computed<Partial<StageConfig>>(() => ({
    draggable: true,
    width: this.width(),
    height: this.height(),
  }));

  public verticalGuideConfig = computed<Partial<LineConfig>>(() => ({
    points: [this.mouseX() - this.stageOffsetX(), -this.stageOffsetY(), this.mouseX() - this.stageOffsetX(), this.height() - this.stageOffsetY()],
    visible: this.hovering(),
    strokeWidth: 1,
    opacity: 0.5,
    stroke: "#FFFFFF",
  }));

  public horizontalGuideConfig = computed<Partial<LineConfig>>(() => ({
    points: [-this.stageOffsetX(), this.mouseY() - this.stageOffsetY(), this.width() - this.stageOffsetX(), this.mouseY() - this.stageOffsetY()],
    visible: this.hovering(),
    strokeWidth: 1,
    opacity: 0.5,
    stroke: "#FFFFFF",
  }));

  constructor(private trackService: TrackService) {}

  resetGrid() {
    this.stage.getStage().to({
      x: 0,
      y: 0,
      duration: 0.5,
      easing: Konva.Easings.EaseInOut,
    });

    this.stageOffsetX.set(0);
    this.stageOffsetY.set(0);
  }

  updateSelector() {
    const { x, y } = this.stage.getStage().getPointerPosition()!;
    this.mouseX.set(x);
    this.mouseY.set(y);
  }

  updateStageOffset() {
    const { x, y } = this.stage.getStage().getPosition();
    this.stageOffsetX.set(x);
    this.stageOffsetY.set(y);
  }

  ngAfterViewInit() {
    this.width.set(this.container.nativeElement.offsetWidth);
    this.height.set(this.container.nativeElement.offsetHeight);
  }

  @HostListener("window:resize")
  resize() {
    this.width.set(this.container.nativeElement.offsetWidth);
    this.height.set(this.container.nativeElement.offsetHeight);
  }

  textConfig = computed(() => ({ text: `x: ${this.stageOffsetX()} y: ${this.stageOffsetY()}`, fill: "#FFFFFF" }));
}
