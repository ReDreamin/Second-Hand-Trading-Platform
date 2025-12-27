#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
模拟数据生成脚本
生成商品数据SQL和下载测试图片
"""

import os
import random
import urllib.request
import time
from datetime import datetime, timedelta

# 配置
NUM_PRODUCTS = 50  # 生成商品数量
IMAGE_DIR = "../backend/uploads"  # 图片保存目录
OUTPUT_SQL = "mock_data.sql"  # 输出SQL文件

# 商品模板数据
PRODUCT_TEMPLATES = [
    # (名称, 分类ID, 价格范围, 描述关键词)
    ("iPhone 13 Pro Max 256G", 1, (3500, 5500), "手机", "苹果", "电子产品"),
    ("MacBook Pro 14寸 M2芯片", 1, (8000, 15000), "笔记本", "苹果", "电脑"),
    ("iPad Air 5代 64G", 1, (2800, 3800), "平板", "苹果", "学习"),
    ("Sony WH-1000XM4 降噪耳机", 1, (1200, 1800), "耳机", "索尼", "音乐"),
    ("佳能 EOS R6 微单相机", 1, (10000, 15000), "相机", "佳能", "摄影"),
    ("戴尔 XPS 15 笔记本电脑", 1, (6000, 10000), "笔记本", "戴尔", "办公"),
    ("任天堂 Switch OLED版", 1, (1800, 2500), "游戏机", "任天堂", "娱乐"),
    ("AirPods Pro 2代", 1, (1200, 1600), "耳机", "苹果", "无线"),
    ("小米13 Ultra 256G", 1, (3000, 4500), "手机", "小米", "拍照"),
    ("华为 MatePad Pro 12.6", 1, (3500, 5000), "平板", "华为", "办公"),

    ("优衣库羽绒服男款", 2, (200, 500), "羽绒服", "冬装", "保暖"),
    ("Nike Air Force 1 低帮板鞋", 3, (400, 700), "运动鞋", "耐克", "百搭"),
    ("Adidas Ultraboost 跑步鞋", 3, (500, 900), "跑鞋", "阿迪达斯", "舒适"),
    ("北面冲锋衣 Gore-Tex", 2, (800, 1500), "冲锋衣", "户外", "防水"),
    ("Levi's 501 经典牛仔裤", 2, (200, 400), "牛仔裤", "经典", "休闲"),
    ("Coach 托特包 真皮", 2, (1000, 2000), "包包", "蔻驰", "通勤"),
    ("优衣库 U系列 卫衣", 2, (100, 200), "卫衣", "休闲", "舒适"),
    ("ZARA 西装外套", 2, (300, 600), "西装", "正装", "商务"),

    ("高等数学同济第七版", 7, (20, 40), "教材", "数学", "考研"),
    ("线性代数同济第六版", 7, (15, 30), "教材", "数学", "基础"),
    ("英语四级真题及解析", 7, (20, 40), "教材", "英语", "四级"),
    ("Python编程从入门到实践", 7, (40, 70), "编程", "Python", "入门"),
    ("算法导论 第三版", 7, (80, 120), "编程", "算法", "经典"),
    ("考研政治肖秀荣1000题", 7, (30, 50), "考研", "政治", "刷题"),

    ("小米台灯Pro", 5, (80, 150), "台灯", "护眼", "学习"),
    ("戴森 V12 无线吸尘器", 5, (2000, 3500), "吸尘器", "戴森", "清洁"),
    ("飞利浦电动牙刷", 5, (200, 400), "牙刷", "电动", "口腔"),
    ("雀巢咖啡机 Nespresso", 5, (500, 1000), "咖啡机", "胶囊", "办公"),
    ("宜家KALLAX书架", 5, (200, 400), "书架", "收纳", "家居"),

    ("Yonex 羽毛球拍 弓箭11", 6, (800, 1500), "羽毛球拍", "尤尼克斯", "进攻"),
    ("Decathlon 瑜伽垫 10mm", 6, (50, 100), "瑜伽垫", "迪卡侬", "健身"),
    ("李宁跑步机家用款", 6, (1500, 3000), "跑步机", "健身", "有氧"),
    ("斯伯丁NBA官方篮球", 6, (150, 300), "篮球", "斯伯丁", "运动"),
    ("KEEP智能哑铃", 6, (300, 600), "哑铃", "健身", "力量"),
]

# 使用时间模板
TIME_TEMPLATES = [
    "一个月",
    "两个月",
    "三个月",
    "半年",
    "一年",
    "一年半",
    "两年",
    "几个星期",
    "一周",
]

# 商品状态模板
CONDITION_TEMPLATES = [
    "保存完好",
    "几乎全新",
    "轻微使用痕迹",
    "正常使用",
    "配件齐全",
    "功能完好",
]

# 描述模板
DESCRIPTION_TEMPLATE = """这是一款{product_name}，购入{time_used}，{condition}。

【商品详情】
- 品牌/型号：{brand}
- 购买渠道：{channel}
- 购买时间：{purchase_date}
- 使用频率：{frequency}

【商品状态】
{status_detail}

【出售原因】
{sell_reason}

【交易方式】
支持当面交易，可小刀。诚心购买可议价，非诚勿扰。

【温馨提示】
二手物品，介意者慎拍。看好再买，售出不退。有问题请及时沟通，谢谢理解！

{extra_info}
"""

# 购买渠道
CHANNELS = ["京东自营", "天猫旗舰店", "线下专卖店", "官网购买", "朋友赠送", "海外代购"]

# 使用频率
FREQUENCIES = ["每天使用", "偶尔使用", "基本闲置", "使用次数不超过10次", "每周使用1-2次"]

# 状态详情
STATUS_DETAILS = [
    "外观完好无划痕，功能一切正常，电池健康度95%以上。",
    "有轻微使用痕迹，不影响使用，所有功能正常。",
    "成色如图所示，实物拍摄，所见即所得。",
    "几乎全新，买来用了几次就一直放着了。",
    "正常使用痕迹，整体状态良好，无暗病。",
]

# 出售原因
SELL_REASONS = [
    "升级换代，闲置出售",
    "毕业清仓，低价处理",
    "搬家不方便带走",
    "冲动消费买多了",
    "换了新的，旧的闲置",
    "不太适合自己，转给有缘人",
]

# 额外信息
EXTRA_INFOS = [
    "可提供购买凭证，支持验货。",
    "同城可面交，外地顺丰到付。",
    "急出，价格好商量！",
    "原装配件齐全，盒子说明书都在。",
    "送运费险，放心购买。",
    "",
]


def download_images():
    """下载测试图片"""
    os.makedirs(IMAGE_DIR, exist_ok=True)

    print(f"正在下载测试图片到 {IMAGE_DIR}...")

    # 使用 picsum.photos 获取随机图片
    for i in range(NUM_PRODUCTS):
        filename = f"product_{i+1:03d}.jpg"
        filepath = os.path.join(IMAGE_DIR, filename)

        if os.path.exists(filepath):
            print(f"  跳过已存在: {filename}")
            continue

        try:
            # 使用 Lorem Picsum 随机图片服务
            url = f"https://picsum.photos/400/300?random={i+1}"
            print(f"  下载中: {filename}...")

            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=30) as response:
                with open(filepath, 'wb') as f:
                    f.write(response.read())

            time.sleep(0.5)  # 避免请求过快

        except Exception as e:
            print(f"  下载失败 {filename}: {e}")
            # 创建占位文件
            continue

    print("图片下载完成！")


def generate_sql():
    """生成SQL插入语句"""
    print("正在生成SQL数据...")

    sql_lines = []
    sql_lines.append("-- 自动生成的模拟商品数据")
    sql_lines.append(f"-- 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sql_lines.append("")
    sql_lines.append("-- 确保有测试用户 (seller_id = 1)")
    sql_lines.append("INSERT INTO user_accounts (id, username, email, password_hash, password_algo, status)")
    sql_lines.append("VALUES (1, 'test_seller', 'seller@test.com', '$argon2id$v=19$m=65536,t=3,p=1$test', 'argon2', 1)")
    sql_lines.append("ON CONFLICT (id) DO NOTHING;")
    sql_lines.append("")
    sql_lines.append("INSERT INTO user_profiles (user_id, nickname)")
    sql_lines.append("VALUES (1, '测试卖家')")
    sql_lines.append("ON CONFLICT (user_id) DO NOTHING;")
    sql_lines.append("")
    sql_lines.append("-- 商品数据")

    for i in range(NUM_PRODUCTS):
        template = random.choice(PRODUCT_TEMPLATES)
        name, category_id, price_range, *keywords = template

        # 随机价格
        price = round(random.uniform(price_range[0], price_range[1]), 2)
        original_price = round(price * random.uniform(1.1, 1.5), 2)

        # 随机成色 (7-10)
        condition = random.choice([7, 8, 9, 10])

        # 生成描述
        time_used = random.choice(TIME_TEMPLATES)
        condition_text = random.choice(CONDITION_TEMPLATES)
        purchase_date = (datetime.now() - timedelta(days=random.randint(30, 730))).strftime("%Y年%m月")

        description = DESCRIPTION_TEMPLATE.format(
            product_name=name,
            time_used=time_used,
            condition=condition_text,
            brand=keywords[0] if keywords else "品牌",
            channel=random.choice(CHANNELS),
            purchase_date=purchase_date,
            frequency=random.choice(FREQUENCIES),
            status_detail=random.choice(STATUS_DETAILS),
            sell_reason=random.choice(SELL_REASONS),
            extra_info=random.choice(EXTRA_INFOS),
        )

        # 图片URL
        cover_url = f"/uploads/product_{i+1:03d}.jpg"

        # 位置
        locations = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "西安", "苏州"]
        location = random.choice(locations)

        # 转义SQL字符串
        name_escaped = name.replace("'", "''")
        description_escaped = description.replace("'", "''")

        sql = f"""INSERT INTO products (seller_id, title, cover_url, description, price, original_price, category_id, condition, status, location, view_count, search_text, created_at, updated_at)
VALUES (1, '{name_escaped}', '{cover_url}', '{description_escaped}', {price}, {original_price}, {category_id}, {condition}, 1, '{location}', {random.randint(0, 500)}, '{name_escaped} {description_escaped[:100]}', NOW() - INTERVAL '{random.randint(1, 30)} days', NOW());"""

        sql_lines.append(sql)
        sql_lines.append("")

    # 写入文件
    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))

    print(f"SQL文件已生成: {OUTPUT_SQL}")


def main():
    print("=" * 50)
    print("模拟数据生成脚本")
    print("=" * 50)

    # 下载图片
    download_images()

    # 生成SQL
    generate_sql()

    print("")
    print("=" * 50)
    print("完成！请执行以下步骤：")
    print(f"1. 将 {OUTPUT_SQL} 导入到 PostgreSQL 数据库")
    print(f"2. 确保 {IMAGE_DIR} 目录下的图片可被访问")
    print("=" * 50)


if __name__ == "__main__":
    main()
