import { animate, AnimationTriggerMetadata, style, transition, trigger } from "@angular/animations";

export function fadeInOut(timingIn = 500, timingOut = 500): AnimationTriggerMetadata {
  return trigger("fadeInOut", [
    transition(":enter", [style({ opacity: 0 }), animate(timingIn, style({ opacity: 1 }))]),
    transition(":leave", [animate(timingOut, style({ opacity: 0 }))]),
  ]);
}
