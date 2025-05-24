<?php

class Model
{
    protected static $table = '';
    protected static $primaryKey = 'id';
    protected $attributes = [];

    public function __get($key)
    {
        return $this->attributes[$key] ?? null;
    }

    public static function find($id)
    {
        global $conn;

        $table = static::$table;
        $primaryKey = static::$primaryKey;

        $stmt = $conn->prepare("SELECT * FROM {$table} WHERE {$primaryKey} = ?");
        if (!$stmt) {
            throw new Exception("Erro ao preparar consulta: " . $conn->error);
        }

        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        $row = $result->fetch_assoc();
        if ($row) {
            $instance = new static();
            $instance->attributes = $row;
            return $instance;
        }

        return null;
    }
}



?>