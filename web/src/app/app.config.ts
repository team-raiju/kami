import { ApplicationConfig, provideExperimentalZonelessChangeDetection, isDevMode, SecurityContext } from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { HttpClient, provideHttpClient } from "@angular/common/http";
import { provideTranslocoPersistLang } from "@jsverse/transloco-persist-lang";
import { provideTransloco } from "@jsverse/transloco";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";

import { routes } from "./app.routes";
import { TranslocoHttpLoader } from "./transloco-loader";
import { CLIPBOARD_OPTIONS, ClipboardButtonComponent, provideMarkdown } from "ngx-markdown";
import { IMAGE_CONFIG } from "@angular/common";

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: "enabled", scrollPositionRestoration: "enabled" })),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ["en", "pt"],
        defaultLang: "pt",
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideTranslocoPersistLang({
      storage: {
        useValue: localStorage,
      },
    }),
    provideMarkdown({
      loader: HttpClient,
      clipboardOptions: {
        provide: CLIPBOARD_OPTIONS,
        useValue: { buttonComponent: ClipboardButtonComponent },
      },
      sanitize: SecurityContext.NONE,
    }),
    { provide: IMAGE_CONFIG, useValue: { disableImageSizeWarning: true, disableImageLazyLoadWarning: true } },
  ],
};
