import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load'
import { FetchInstrumentation } from  '@opentelemetry/instrumentation-fetch'
import { XMLHttpRequestInstrumentation } from  '@opentelemetry/instrumentation-xml-http-request'
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction'
import { ZoneContextManager } from '@opentelemetry/context-zone'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'

// import { AudiusInstrumention } from '@audius/instrumentation-audius'


const TRACING_ENABLED = true
const OTEL_COLLECTOR_URL = ''

export const setupTracing = () => {
  // If tracing isn't enabled, we don't set up the trace provider
  // or register any instrumentations. This won't cause any errors
  // as methods like `span.startActiveTrace()` or `tracing.recordException()`
  // will just silently do nothing.
  if (!TRACING_ENABLED) return

    const provider = new WebTracerProvider();
    const exporter = new OTLPTraceExporter({
        url: OTEL_COLLECTOR_URL
    })
    provider.addSpanProcessor(new BatchSpanProcessor(exporter))

    provider.register({
        // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
        contextManager: new ZoneContextManager(),
    });

    // Registering instrumentations
    registerInstrumentations({
        instrumentations: [
            new UserInteractionInstrumentation(),
            new XMLHttpRequestInstrumentation(),
            new FetchInstrumentation(),
            new DocumentLoadInstrumentation(),
            // new AudiusInstrumentation()
        ],
    });
}
