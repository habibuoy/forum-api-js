/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.addColumn(
    'threads',
    {
      date: {
        type: 'VARCHAR(50)',
      },
    },
  );

  pgm.addColumn(
    'comments',
    {
      date: {
        type: 'VARCHAR(50)',
      },
    },
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropColumn('comments', 'date');
  pgm.dropColumn('threads', 'date');
};
