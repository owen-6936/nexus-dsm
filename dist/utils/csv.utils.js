import { transformPapaParseError } from "../adapters/papaparse.adapter.js";
import readFile from "./filereader.util.js";
export default async function parseCSV(file) {
    const customErrors = [];
    const response = await readFile(file);
    if (!response.success)
        return {
            success: false,
            name: "FileReadError",
            message: response.message,
            type: "FileReadError",
            code: "CSVFileReadError",
        };
    const csv = response.content;
    if (csv.trim().length === 0) {
        const csvEmptyFileError = {
            name: "CSVEmptyFileError",
            message: "CSV file is empty or contains no data.",
            type: "EmptyFileError",
            code: "EmptyFile",
        };
        customErrors.push(csvEmptyFileError);
    }
    const result = window.Papa.parse(csv, { dynamicTyping: true, header: true });
    /* papaparse merged it's result.meta.errors into result.errors */
    if (!(result.meta.fields !== undefined) || result.meta.fields.length === 0) {
        const csvNoHeadersError = {
            name: "CSVNoHeadersError",
            message: "CSV file has no valid headers. Ensure the first line is not empty.",
            type: "NoHeadersError",
            code: "NoHeaders",
        };
        customErrors.push(csvNoHeadersError);
    }
    if (result.data.length === 0 &&
        result.meta.fields &&
        result.meta.fields.length > 0) {
        const csvNoValidDataRowsError = {
            name: "CSVNoValidDataRowsError",
            message: "CSV file contains headers but no valid data rows could be parsed.",
            type: "NoValidDataRowsError",
            code: "InvalidDataRows",
        };
        customErrors.push(csvNoValidDataRowsError);
    }
    result.errors.forEach((error) => {
        customErrors.push(transformPapaParseError(error));
    });
    if (customErrors.length === 0) {
        const customResult = {
            meta: result.meta,
            data: result.data,
            success: true,
        };
        return customResult;
    }
    else {
        const primaryError = customErrors[0]; // Get the first error for the main message
        const errorResponse = {
            // Use CsvErrorResponse interface
            success: false,
            name: primaryError.name,
            message: primaryError.message,
            type: primaryError.type,
            code: primaryError.code,
            detailedErrors: customErrors, // Include all collected errors
        };
        return errorResponse;
    }
}
//# sourceMappingURL=csv.utils.js.map