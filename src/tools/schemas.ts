import { z } from 'zod';

const pageSchema = z.number({
  invalid_type_error: '"page"パラメータは数値でなければなりません',
}).int('"page"パラメータは整数でなければなりません').positive('"page"パラメータは1以上でなければなりません').optional();

const autoTaskStatusSchema = z.enum(['to_do', 'in_progress', 'done', 'cancel', 'pending', '']).optional();
const taskStatusSchema = z.enum(['to_do', 'in_progress', 'done', 'cancel', 'pending']);

const listDetailLevelSchema = z.enum(['compact', 'standard'], {
  invalid_type_error: '"detail_level"パラメータは"compact"または"standard"でなければなりません',
}).default('compact');

const boardListSchema = z.object({
  page: pageSchema,
  detail_level: listDetailLevelSchema,
});

const taskBoardIdSchema = z.number({
  required_error: '"board_id"パラメータは必須です。プロジェクトが指定されていない場合は、先にユーザーへ対象プロジェクトを確認してください。候補が必要な場合はjooto-list-projectsを使用してください',
  invalid_type_error: '"board_id"パラメータは数値でなければなりません',
});

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const daysPerMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysPerMonth[month - 1];
}

function padDateTimePart(value: number): string {
  return value.toString().padStart(2, '0');
}

export function normalizeJootoDateTime(value: string): string {
  const input = value.trim();
  const dateOnlyMatch = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (dateOnlyMatch) {
    const [, yearText, monthText, dayText] = dateOnlyMatch;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    if (!isValidCalendarDate(year, month, day)) {
      throw new Error('実在しない日付です');
    }

    return `${yearText}-${padDateTimePart(month)}-${padDateTimePart(day)}`;
  }

  const dateTimeMatch = input.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[Tt ](\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(Z|z|[+-]\d{2}:?\d{2})$/
  );
  if (!dateTimeMatch) {
    throw new Error('対応していない日付形式です');
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText = '00', timeZoneText] = dateTimeMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (
    !isValidCalendarDate(year, month, day) ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59 ||
    second < 0 || second > 59
  ) {
    throw new Error('実在しない日時です');
  }

  let offsetMinutes = 0;
  if (timeZoneText.toUpperCase() !== 'Z') {
    const offsetMatch = timeZoneText.match(/^([+-])(\d{2}):?(\d{2})$/);
    if (!offsetMatch) {
      throw new Error('タイムゾーンが不正です');
    }

    const [, sign, offsetHourText, offsetMinuteText] = offsetMatch;
    const offsetHour = Number(offsetHourText);
    const offsetMinute = Number(offsetMinuteText);
    if (offsetHour > 23 || offsetMinute > 59) {
      throw new Error('タイムゾーンが不正です');
    }

    offsetMinutes = (offsetHour * 60 + offsetMinute) * (sign === '+' ? 1 : -1);
  }

  const localDateTime = new Date(0);
  localDateTime.setUTCFullYear(year, month - 1, day);
  localDateTime.setUTCHours(hour, minute, second, 0);
  const utcTimestamp = localDateTime.getTime() - offsetMinutes * 60_000;
  const utcDate = new Date(utcTimestamp);
  const utcYear = utcDate.getUTCFullYear();
  if (Number.isNaN(utcTimestamp) || utcYear < 1 || utcYear > 9999) {
    throw new Error('変換後の日時が対応範囲外です');
  }

  return utcDate.toISOString().replace('.000Z', 'Z');
}

function jootoDateTimeSchema(
  fieldName: 'start_date_time' | 'deadline_date_time',
  options: { allowEmpty?: boolean } = {}
) {
  return z.string({
    invalid_type_error: `"${fieldName}"パラメータは文字列でなければなりません`,
  }).transform((value, context) => {
    if (options.allowEmpty && value === '') {
      return value;
    }

    try {
      return normalizeJootoDateTime(value);
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `"${fieldName}"は日付のみならYYYY-MM-DD、時刻付きならタイムゾーンを含むYYYY-MM-DDTHH:mm:ssZ形式で指定してください`,
      });
      return z.NEVER;
    }
  }).optional();
}

const taskListFilterSchema = {
  category_ids: z.array(z.number()).optional(),
  assignee_ids: z.array(z.number()).optional(),
  deadline_since: z.string().optional(),
  deadline_until: z.string().optional(),
  status: z.array(taskStatusSchema).optional(),
};
/**
 * ツール引数のZodスキーマ定義
 * 取得系（list / get）は resources としても公開しているが、MCP クライアントの対応状況を鑑み tool としても公開する。
 */
export const toolSchemas = {
  // === Read（取得系） ===
  'jooto-get-organization': z.object({}),
  'jooto-get-rate-limit': z.object({}),
  'jooto-list-users': z.object({
    page: pageSchema,
    detail_level: listDetailLevelSchema,
  }),
  'jooto-get-user': z.object({
    user_id: z.number({
      required_error: '"user_id"パラメータは必須です',
      invalid_type_error: '"user_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-projects': boardListSchema,
  'jooto-list-boards': boardListSchema,
  'jooto-list-archived-projects': boardListSchema,
  'jooto-list-archived-boards': boardListSchema,
  'jooto-get-board': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-board-activities': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
    detail_level: listDetailLevelSchema,
  }),
  'jooto-list-board-members': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
    detail_level: listDetailLevelSchema,
  }),
  'jooto-list-lists': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
    detail_level: listDetailLevelSchema,
  }),
  'jooto-list-archived-lists': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
    detail_level: listDetailLevelSchema,
  }),
  'jooto-get-list': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    list_id: z.number({
      required_error: '"list_id"パラメータは必須です',
      invalid_type_error: '"list_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-labels': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
    detail_level: listDetailLevelSchema,
  }),
  'jooto-get-label': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    category_id: z.number({
      required_error: '"category_id"パラメータは必須です',
      invalid_type_error: '"category_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-tasks': z.object({
    board_id: taskBoardIdSchema,
    page: pageSchema,
    ...taskListFilterSchema,
    detail_level: listDetailLevelSchema,
  }),
  'jooto-list-archived-tasks': z.object({
    board_id: taskBoardIdSchema,
    page: pageSchema,
    ...taskListFilterSchema,
    detail_level: listDetailLevelSchema,
  }),
  'jooto-get-task': z.object({
    board_id: taskBoardIdSchema,
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-comments': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
    detail_level: listDetailLevelSchema,
  }),
  'jooto-get-comment': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    comment_id: z.number({
      required_error: '"comment_id"パラメータは必須です',
      invalid_type_error: '"comment_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-checklists': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
    detail_level: listDetailLevelSchema,
  }),
  'jooto-get-checklist': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-list-checklist-items': z.object({
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
    page: pageSchema,
    detail_level: listDetailLevelSchema,
  }),
  'jooto-get-checklist-item': z.object({
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
    item_id: z.number({
      required_error: '"item_id"パラメータは必須です',
      invalid_type_error: '"item_id"パラメータは数値でなければなりません',
    }),
  }),
  // === Board ===
  'jooto-create-board': z.object({
    title: z.string({
      required_error: '"title"パラメータは必須です',
      invalid_type_error: '"title"パラメータは文字列でなければなりません',
    }),
    description: z.string().optional(),
  }),
  'jooto-update-board': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    title: z.string().optional(),
    description: z.string().optional(),
  }),
  'jooto-delete-board': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
  }),
  // === List ===
  'jooto-create-list': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    name: z.string({
      required_error: '"name"パラメータは必須です',
      invalid_type_error: '"name"パラメータは文字列でなければなりません',
    }),
    color: z.string().optional(),
    auto_task_status: autoTaskStatusSchema,
  }),
  'jooto-update-list': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    list_id: z.number({
      required_error: '"list_id"パラメータは必須です',
      invalid_type_error: '"list_id"パラメータは数値でなければなりません',
    }),
    name: z.string().optional(),
    color: z.string().optional(),
    auto_task_status: autoTaskStatusSchema,
  }),
  'jooto-delete-list': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    list_id: z.number({
      required_error: '"list_id"パラメータは必須です',
      invalid_type_error: '"list_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-archive-list': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    list_id: z.number({
      required_error: '"list_id"パラメータは必須です',
      invalid_type_error: '"list_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-reorder-list': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    list_ids: z.array(z.number(), {
      required_error: '"list_ids"パラメータは必須です',
      invalid_type_error: '"list_ids"パラメータは数値の配列でなければなりません',
    }),
  }),
  // === Task ===
  'jooto-create-task': z.object({
    board_id: taskBoardIdSchema,
    name: z.string({
      required_error: '"name"パラメータは必須です',
      invalid_type_error: '"name"パラメータは文字列でなければなりません',
    }),
    list_id: z.number({
      required_error: '"list_id"パラメータは必須です',
      invalid_type_error: '"list_id"パラメータは数値でなければなりません',
    }),
    description: z.string().optional(),
    assigned_user_ids: z.array(z.number()).optional(),
    start_date_time: jootoDateTimeSchema('start_date_time'),
    deadline_date_time: jootoDateTimeSchema('deadline_date_time'),
    category_ids: z.array(z.number()).optional(),
    effort: z.string().optional(),
    actual: z.string().optional(),
    status: z.enum(['to_do', 'done', 'cancel', 'pending', 'in_progress']).optional(),
  }),
  'jooto-update-task': z.object({
    board_id: taskBoardIdSchema,
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    name: z.string().optional(),
    description: z.string().optional(),
    assigned_user_ids: z.array(z.number()).optional(),
    start_date_time: jootoDateTimeSchema('start_date_time', { allowEmpty: true }),
    deadline_date_time: jootoDateTimeSchema('deadline_date_time', { allowEmpty: true }),
    list_id: z.number().optional(),
    category_ids: z.array(z.number()).optional(),
    effort: z.string().optional(),
    actual: z.string().optional(),
    status: z.enum(['to_do', 'done', 'cancel', 'pending', 'in_progress']).optional(),
  }),
  'jooto-delete-task': z.object({
    board_id: taskBoardIdSchema,
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-search-task': z.object({
    board_id: taskBoardIdSchema,
    search_query: z.string({
      required_error: '"search_query"パラメータは必須です',
      invalid_type_error: '"search_query"パラメータは文字列でなければなりません',
    }),
    page: z.number({
      invalid_type_error: '"page"パラメータは数値でなければなりません',
    }).optional(),
    per_page: z.number({
      invalid_type_error: '"per_page"パラメータは数値でなければなりません',
    })
      .int('"per_page"パラメータは整数でなければなりません')
      .positive('"per_page"パラメータは1以上でなければなりません')
      .max(20, '"per_page"パラメータは20以下でなければなりません')
      .optional(),
    order: z.string({
      invalid_type_error: '"order"パラメータは文字列でなければなりません',
    }).optional(),
    detail_level: listDetailLevelSchema,
  }),
  'jooto-move-task': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    board_id: taskBoardIdSchema,
    list_id: z.number({
      required_error: '"list_id"パラメータは必須です',
      invalid_type_error: '"list_id"パラメータは数値でなければなりません',
    }),
  }),
  'jooto-archive-task': z.object({
    board_id: taskBoardIdSchema,
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
  }),
  // === Comment ===
  'jooto-create-comment': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    content: z.string({
      required_error: '"content"パラメータは必須です',
      invalid_type_error: '"content"パラメータは文字列でなければなりません',
    }),
  }),
  'jooto-update-comment': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    comment_id: z.number({
      required_error: '"comment_id"パラメータは必須です',
      invalid_type_error: '"comment_id"パラメータは数値でなければなりません',
    }),
    content: z.string().optional(),
  }),
  // === Label ===
  'jooto-create-label': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    name: z.string({
      required_error: '"name"パラメータは必須です',
      invalid_type_error: '"name"パラメータは文字列でなければなりません',
    }),
    color: z.string().optional(),
  }),
  'jooto-update-label': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    category_id: z.number({
      required_error: '"category_id"パラメータは必須です',
      invalid_type_error: '"category_id"パラメータは数値でなければなりません',
    }),
    name: z.string().optional(),
    color: z.string().optional(),
  }),
  'jooto-delete-label': z.object({
    board_id: z.number({
      required_error: '"board_id"パラメータは必須です',
      invalid_type_error: '"board_id"パラメータは数値でなければなりません',
    }),
    category_id: z.number({
      required_error: '"category_id"パラメータは必須です',
      invalid_type_error: '"category_id"パラメータは数値でなければなりません',
    }),
  }),
  // === Checklist ===
  'jooto-create-checklist': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    title: z.string({
      required_error: '"title"パラメータは必須です',
      invalid_type_error: '"title"パラメータは文字列でなければなりません',
    }),
  }),
  'jooto-update-checklist': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
    title: z.string().optional(),
  }),
  'jooto-delete-checklist': z.object({
    task_id: z.number({
      required_error: '"task_id"パラメータは必須です',
      invalid_type_error: '"task_id"パラメータは数値でなければなりません',
    }),
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
  }),
  // === Checklist Item ===
  'jooto-create-checklist-item': z.object({
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
    content: z.string({
      required_error: '"content"パラメータは必須です',
      invalid_type_error: '"content"パラメータは文字列でなければなりません',
    }),
    start_date_time: jootoDateTimeSchema('start_date_time'),
    deadline_date_time: jootoDateTimeSchema('deadline_date_time'),
  }),
  'jooto-update-checklist-item': z.object({
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
    item_id: z.number({
      required_error: '"item_id"パラメータは必須です',
      invalid_type_error: '"item_id"パラメータは数値でなければなりません',
    }),
    content: z.string().optional(),
    checked: z.boolean().optional(),
    start_date_time: jootoDateTimeSchema('start_date_time', { allowEmpty: true }),
    deadline_date_time: jootoDateTimeSchema('deadline_date_time', { allowEmpty: true }),
  }),
  'jooto-delete-checklist-item': z.object({
    checklist_id: z.number({
      required_error: '"checklist_id"パラメータは必須です',
      invalid_type_error: '"checklist_id"パラメータは数値でなければなりません',
    }),
    item_id: z.number({
      required_error: '"item_id"パラメータは必須です',
      invalid_type_error: '"item_id"パラメータは数値でなければなりません',
    }),
  }),
};

// 型安全のためのツールスキーマの型
export type ToolSchemas = typeof toolSchemas;

/**
 * ツールハンドラーの型定義
 */
export type ToolHandler<T = any> = (args: T) => Promise<{
  content: Array<{
    type: string;
    text: string;
  }>;
}>;
