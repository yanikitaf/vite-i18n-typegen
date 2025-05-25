export interface Config {
  inputDir: string | null;
  outputPath: string;
  outputFileName: string;
  localeFilesExtension: string;
  generateKeys: boolean;
  generateParams: boolean;
  generateDocs: boolean;
  preferredLangOrder: string[];
  generateOnChange?: boolean;
}
