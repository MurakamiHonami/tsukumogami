resource "aws_dynamodb_table" "app_data" {
  name         = coalesce(var.dynamodb_table_name, "${local.name_prefix}-app-data")
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = local.common_tags
}
