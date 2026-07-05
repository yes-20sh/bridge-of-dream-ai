declare module 'mammoth' {
  export interface MammothResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
      id?: string;
    }>;
  }

  export interface ExtractOptions {
    arrayBuffer: ArrayBuffer;
  }

  export function extractRawText(options: ExtractOptions): Promise<MammothResult>;
  export function convertToHtml(options: ExtractOptions): Promise<MammothResult>;
}
