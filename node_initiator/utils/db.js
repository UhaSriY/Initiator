exports.getConnection = (pool) => {
  return pool.getConnectionAsync().disposer((conn, promise) => {
    conn.release();
  });
};

