# Gold Admin Panel - Stored Procedures for MS SQL Server

> Execute these stored procedures in order. All SP names follow the convention: `report_[pagename]_[name]`

---

## 1. DASHBOARD

### 1.1 Dashboard KPIs

```sql
CREATE PROCEDURE report_dashboard_getkpis
    @FromDate DATE = NULL,
    @ToDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @FromDate IS NULL SET @FromDate = DATEADD(MONTH, -1, GETDATE());
    IF @ToDate IS NULL SET @ToDate = GETDATE();

    -- Previous period for delta calculation
    DECLARE @PrevFrom DATE = DATEADD(DAY, -DATEDIFF(DAY, @FromDate, @ToDate), @FromDate);
    DECLARE @PrevTo DATE = @FromDate;

    SELECT
        -- Current Period
        (SELECT COUNT(*) FROM tbl_User_AUG WHERE CreatedAt BETWEEN @FromDate AND @ToDate) AS TotalUsers,
        (SELECT COUNT(*) FROM tbl_GoldLite_Goal WHERE Ts BETWEEN @FromDate AND @ToDate) AS TotalGoals,
        (SELECT COUNT(*) FROM tbl_User_Buy_AUG WHERE Ts BETWEEN @FromDate AND @ToDate) AS TotalBuyTransactions,
        (SELECT COUNT(*) FROM tbl_User_Sell_AUG WHERE CreatedAt BETWEEN @FromDate AND @ToDate) AS TotalSellTransactions,
        (SELECT COUNT(*) FROM tbl_Order_Aug WHERE OrderStatus != 'Cancelled' AND CreatedAt BETWEEN @FromDate AND @ToDate) AS TotalRedeemRequests,
        (SELECT COUNT(*) FROM tbl_Gold_SIP_Payment_Schedule WHERE PaymentStatus = 'Success' AND Ts BETWEEN @FromDate AND @ToDate) AS SIPSuccess,
        (SELECT COUNT(*) FROM tbl_Gold_SIP_Payment_Schedule WHERE PaymentStatus = 'Failed' AND Ts BETWEEN @FromDate AND @ToDate) AS SIPFailed,
        (SELECT COUNT(*) FROM tbl_User_AUG_Nominee WHERE Ts BETWEEN @FromDate AND @ToDate) AS NominationsCreated,
        (SELECT ISNULL(SUM(TotalAmount), 0) FROM tbl_User_Buy_AUG WHERE Ts BETWEEN @FromDate AND @ToDate) AS TotalBuyValue,
        (SELECT ISNULL(SUM(TotalAmount), 0) FROM tbl_User_Sell_AUG WHERE CreatedAt BETWEEN @FromDate AND @ToDate) AS TotalSellValue,
        (SELECT COUNT(*) FROM tbl_User_AUG WHERE KycStatus = 'approved') AS ActiveUsers,
        (SELECT COUNT(*) FROM tbl_User_AUG WHERE KycStatus = 'pending') AS PendingKyc,
        (SELECT COUNT(*) FROM tbl_Gold_SIP WHERE Status = 1) AS ActiveSIPs,
        (SELECT COUNT(*) FROM tbl_User_Buy_AUG WHERE MetalType = 'gold' AND Ts BETWEEN @FromDate AND @ToDate) AS GoldBuys,
        (SELECT COUNT(*) FROM tbl_User_Buy_AUG WHERE MetalType = 'silver' AND Ts BETWEEN @FromDate AND @ToDate) AS SilverBuys,

        -- Previous Period (for delta %)
        (SELECT COUNT(*) FROM tbl_User_AUG WHERE CreatedAt BETWEEN @PrevFrom AND @PrevTo) AS PrevTotalUsers,
        (SELECT COUNT(*) FROM tbl_User_Buy_AUG WHERE Ts BETWEEN @PrevFrom AND @PrevTo) AS PrevBuyTransactions,
        (SELECT COUNT(*) FROM tbl_User_Sell_AUG WHERE CreatedAt BETWEEN @PrevFrom AND @PrevTo) AS PrevSellTransactions;
END
GO
```

### 1.2 Dashboard Live Rates

```sql
CREATE PROCEDURE report_dashboard_getliverates
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        Id,
        JsonOutput,
        ts AS Timestamp
    FROM tbl_Aug_CurrentRate
    ORDER BY ts DESC;
END
GO
```

### 1.3 Dashboard Transaction Trend (Monthly)

```sql
CREATE PROCEDURE report_dashboard_gettransactiontrend
    @Year INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Year IS NULL SET @Year = YEAR(GETDATE());

    SELECT
        MONTH(Ts) AS MonthNum,
        DATENAME(MONTH, Ts) AS MonthName,
        SUM(CASE WHEN MetalType = 'gold' THEN TotalAmount ELSE 0 END) AS GoldVolume,
        SUM(CASE WHEN MetalType = 'silver' THEN TotalAmount ELSE 0 END) AS SilverVolume,
        COUNT(CASE WHEN MetalType = 'gold' THEN 1 END) AS GoldCount,
        COUNT(CASE WHEN MetalType = 'silver' THEN 1 END) AS SilverCount
    FROM tbl_User_Buy_AUG
    WHERE YEAR(Ts) = @Year
    GROUP BY MONTH(Ts), DATENAME(MONTH, Ts)
    ORDER BY MONTH(Ts);
END
GO
```

### 1.4 Dashboard Recent Activity

```sql
CREATE PROCEDURE report_dashboard_getrecentactivity
    @Top INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@Top) * FROM (
        SELECT UserName, 'bought ' + CAST(Quantity AS VARCHAR) + 'g ' + MetalType AS Action, Ts AS ActivityTime, 'buy' AS ActivityType
        FROM tbl_User_Buy_AUG

        UNION ALL

        SELECT UserName, 'sold ' + CAST(Quantity AS VARCHAR) + 'g ' + MetalType AS Action, CreatedAt AS ActivityTime, 'sell' AS ActivityType
        FROM tbl_User_Sell_AUG

        UNION ALL

        SELECT u.UserName, 'completed KYC' AS Action, u.CreatedAt AS ActivityTime, 'kyc' AS ActivityType
        FROM tbl_User_AUG u WHERE u.KycStatus = 'approved'

        UNION ALL

        SELECT g.GoalName + ' goal created' AS UserName, 'created goal' AS Action, g.Ts AS ActivityTime, 'goal' AS ActivityType
        FROM tbl_GoldLite_Goal g
    ) AS Activities
    ORDER BY ActivityTime DESC;
END
GO
```

---

## 2. USERS

### 2.1 Users KPIs

```sql
CREATE PROCEDURE report_users_getkpis
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS TotalUsers,
        SUM(CASE WHEN KycStatus = 'approved' THEN 1 ELSE 0 END) AS Approved,
        SUM(CASE WHEN KycStatus = 'pending' THEN 1 ELSE 0 END) AS Pending,
        SUM(CASE WHEN KycStatus = 'rejected' THEN 1 ELSE 0 END) AS Rejected,
        SUM(CASE WHEN CreatedAt >= DATEADD(MONTH, -1, GETDATE()) THEN 1 ELSE 0 END) AS NewThisMonth
    FROM tbl_User_AUG;
END
GO
```

### 2.2 Users List with Filters

```sql
CREATE PROCEDURE report_users_getlist
    @Search NVARCHAR(200) = NULL,
    @KycStatus NVARCHAR(20) = NULL,
    @State NVARCHAR(100) = NULL,
    @SortBy NVARCHAR(20) = 'latest',
    @PageNumber INT = 1,
    @PageSize INT = 15
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.Id, u.UID, u.UserName, u.UniqueId, u.MobileNumber,
        u.DateOfBirth, u.Gender, u.UserEmail, u.UserAddress,
        u.UserPincode, u.NomineeName, u.NomineeRelation,
        u.KycStatus, u.UserState, u.UserCity, u.CreatedAt, u.Pannumber,
        COUNT(*) OVER() AS TotalCount
    FROM tbl_User_AUG u
    WHERE
        (@Search IS NULL OR u.UserName LIKE '%' + @Search + '%'
            OR u.MobileNumber LIKE '%' + @Search + '%'
            OR u.UserEmail LIKE '%' + @Search + '%')
        AND (@KycStatus IS NULL OR u.KycStatus = @KycStatus)
        AND (@State IS NULL OR u.UserState = @State)
    ORDER BY
        CASE WHEN @SortBy = 'latest' THEN u.CreatedAt END DESC,
        CASE WHEN @SortBy = 'name' THEN u.UserName END ASC,
        CASE WHEN @SortBy = 'state' THEN u.UserState END ASC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

### 2.3 Users State List (for dropdown)

```sql
CREATE PROCEDURE report_users_getstates
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT UserState
    FROM tbl_User_AUG
    WHERE UserState IS NOT NULL
    ORDER BY UserState;
END
GO
```

---

## 3. TRANSACTIONS

### 3.1 Buy Transactions List

```sql
CREATE PROCEDURE report_transactions_getbuylist
    @Search NVARCHAR(200) = NULL,
    @MetalType NVARCHAR(10) = NULL,
    @FromDate DATE = NULL,
    @ToDate DATE = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        b.Id, b.Quantity, b.TotalAmount, b.PreTaxAmount, b.MetalType,
        b.Rate, b.UniqueId, b.TransactionId, b.UserName,
        b.MobileNumber, b.GoldBalance, b.SilverBalance,
        b.InvoiceNumber, b.Ts, b.PaymentOrderID,
        b.IsWeb, b.SIP_ID, b.Schedule_ID,
        COUNT(*) OVER() AS TotalCount
    FROM tbl_User_Buy_AUG b
    WHERE
        (@Search IS NULL OR b.UserName LIKE '%' + @Search + '%'
            OR b.TransactionId LIKE '%' + @Search + '%'
            OR b.MobileNumber LIKE '%' + @Search + '%')
        AND (@MetalType IS NULL OR b.MetalType = @MetalType)
        AND (@FromDate IS NULL OR CAST(b.Ts AS DATE) >= @FromDate)
        AND (@ToDate IS NULL OR CAST(b.Ts AS DATE) <= @ToDate)
    ORDER BY b.Ts DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

### 3.2 Sell Transactions List

```sql
CREATE PROCEDURE report_transactions_getselllist
    @Search NVARCHAR(200) = NULL,
    @MetalType NVARCHAR(10) = NULL,
    @FromDate DATE = NULL,
    @ToDate DATE = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        s.Id, s.MerchantId, s.Quantity, s.TotalAmount, s.PreTaxAmount,
        s.MetalType, s.Rate, s.UniqueId, s.TransactionId, s.UserName,
        s.MerchantTransactionId, s.MobileNumber, s.GoldBalance,
        s.SilverBalance, s.CreatedAt, s.IsWeb, s.BankAccountId,
        s.SellPaymentDone, s.PaymentSlip,
        COUNT(*) OVER() AS TotalCount
    FROM tbl_User_Sell_AUG s
    WHERE
        (@Search IS NULL OR s.UserName LIKE '%' + @Search + '%'
            OR s.TransactionId LIKE '%' + @Search + '%'
            OR s.MobileNumber LIKE '%' + @Search + '%')
        AND (@MetalType IS NULL OR s.MetalType = @MetalType)
        AND (@FromDate IS NULL OR CAST(s.CreatedAt AS DATE) >= @FromDate)
        AND (@ToDate IS NULL OR CAST(s.CreatedAt AS DATE) <= @ToDate)
    ORDER BY s.CreatedAt DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

### 3.3 Transaction KPIs

```sql
CREATE PROCEDURE report_transactions_getkpis
    @FromDate DATE = NULL,
    @ToDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT(*) FROM tbl_User_Buy_AUG WHERE @FromDate IS NULL OR CAST(Ts AS DATE) BETWEEN @FromDate AND ISNULL(@ToDate, GETDATE())) AS BuyCount,
        (SELECT COUNT(*) FROM tbl_User_Sell_AUG WHERE @FromDate IS NULL OR CAST(CreatedAt AS DATE) BETWEEN @FromDate AND ISNULL(@ToDate, GETDATE())) AS SellCount,
        (SELECT ISNULL(SUM(TotalAmount), 0) FROM tbl_User_Buy_AUG WHERE @FromDate IS NULL OR CAST(Ts AS DATE) BETWEEN @FromDate AND ISNULL(@ToDate, GETDATE())) AS BuyVolume,
        (SELECT ISNULL(SUM(TotalAmount), 0) FROM tbl_User_Sell_AUG WHERE @FromDate IS NULL OR CAST(CreatedAt AS DATE) BETWEEN @FromDate AND ISNULL(@ToDate, GETDATE())) AS SellVolume;
END
GO
```

---

## 4. GOALS

### 4.1 Goals List with User Details

```sql
CREATE PROCEDURE report_goals_getlist
    @Search NVARCHAR(200) = NULL,
    @MetalType NVARCHAR(10) = NULL,
    @Status NVARCHAR(20) = NULL,
    @SortBy NVARCHAR(20) = 'latest',
    @PageNumber INT = 1,
    @PageSize INT = 15
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        g.Id, g.GoalName, g.MetalType, g.SIPID, g.Amount AS TargetAmount,
        g.ImageURl, g.Ts AS CreatedAt, g.Type,
        s.SIP_Name, s.SIP_Amount, s.SIP_Frequency,
        s.StartDate, s.EndDate, s.Duration, s.Status AS SIPStatus,
        s.PaymentMode, s.MetalType AS SIPMetalType,
        u.UserName, u.MobileNumber, u.UserEmail, u.KycStatus,
        u.UserState, u.UniqueId,
        (SELECT COUNT(*) FROM tbl_Gold_SIP_Payment_Schedule ps WHERE ps.SIP_ID = g.SIPID AND ps.PaymentStatus = 'Success') AS InstallmentsPaid,
        (SELECT COUNT(*) FROM tbl_Gold_SIP_Payment_Schedule ps WHERE ps.SIP_ID = g.SIPID) AS TotalInstallments,
        (SELECT ISNULL(SUM(b.TotalAmount), 0) FROM tbl_User_Buy_AUG b WHERE b.SIP_ID = g.SIPID) AS CurrentAmount,
        COUNT(*) OVER() AS TotalCount
    FROM tbl_GoldLite_Goal g
    LEFT JOIN tbl_Gold_SIP s ON g.SIPID = s.Id
    LEFT JOIN tbl_User_AUG u ON s.AugUniqueId = u.UniqueId
    WHERE
        (@Search IS NULL OR u.UserName LIKE '%' + @Search + '%'
            OR g.GoalName LIKE '%' + @Search + '%'
            OR u.MobileNumber LIKE '%' + @Search + '%')
        AND (@MetalType IS NULL OR g.MetalType = @MetalType)
        AND (@Status IS NULL OR
            CASE WHEN s.Status = 1 THEN 'active'
                 WHEN s.Status = 0 THEN 'paused'
                 ELSE 'completed' END = @Status)
    ORDER BY
        CASE WHEN @SortBy = 'latest' THEN g.Ts END DESC,
        CASE WHEN @SortBy = 'name' THEN u.UserName END ASC,
        CASE WHEN @SortBy = 'amount-high' THEN g.Amount END DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

### 4.2 Goals KPIs

```sql
CREATE PROCEDURE report_goals_getkpis
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS TotalGoals,
        SUM(CASE WHEN MetalType = 'gold' THEN 1 ELSE 0 END) AS GoldGoals,
        SUM(CASE WHEN MetalType = 'silver' THEN 1 ELSE 0 END) AS SilverGoals,
        ISNULL(SUM(Amount), 0) AS TotalTargetValue,
        (SELECT COUNT(*) FROM tbl_Gold_SIP WHERE Status = 1) AS ActiveGoals
    FROM tbl_GoldLite_Goal;
END
GO
```

### 4.3 Goal Type Breakdown

```sql
CREATE PROCEDURE report_goals_gettypebreakdown
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Total INT = (SELECT COUNT(*) FROM tbl_GoldLite_Goal);

    SELECT
        GoalName,
        COUNT(*) AS GoalCount,
        CAST(COUNT(*) * 100.0 / NULLIF(@Total, 0) AS DECIMAL(5,1)) AS Percentage
    FROM tbl_GoldLite_Goal
    GROUP BY GoalName
    ORDER BY COUNT(*) DESC;
END
GO
```

---

## 5. VAULT

### 5.1 Vault Customer Holdings

```sql
CREATE PROCEDURE report_vault_getcustomerholdings
    @Search NVARCHAR(200) = NULL,
    @MetalFilter NVARCHAR(20) = NULL,
    @BalanceFilter NVARCHAR(20) = NULL,
    @SortBy NVARCHAR(20) = 'value-high',
    @PageNumber INT = 1,
    @PageSize INT = 15
AS
BEGIN
    SET NOCOUNT ON;

    -- Get latest rates
    DECLARE @GoldRate DECIMAL(12,2), @SilverRate DECIMAL(12,2);
    SELECT TOP 1
        @GoldRate = CAST(JSON_VALUE(JsonOutput, '$.result.data.rates.gBuy') AS DECIMAL(12,2)),
        @SilverRate = CAST(JSON_VALUE(JsonOutput, '$.result.data.rates.sBuy') AS DECIMAL(12,2))
    FROM tbl_Aug_CurrentRate ORDER BY ts DESC;

    ;WITH UserHoldings AS (
        SELECT
            u.Id, u.UID, u.UserName, u.MobileNumber, u.UniqueId,
            u.KycStatus, u.UserState,
            ISNULL(u.GoldBalance, 0) AS GoldBalance,
            ISNULL(u.SilverBalance, 0) AS SilverBalance,
            ISNULL(u.GoldBalance, 0) * @GoldRate AS GoldValue,
            ISNULL(u.SilverBalance, 0) * @SilverRate AS SilverValue,
            (ISNULL(u.GoldBalance, 0) * @GoldRate) + (ISNULL(u.SilverBalance, 0) * @SilverRate) AS TotalValue,
            (SELECT COUNT(*) FROM tbl_User_Buy_AUG b WHERE b.UniqueId = u.UniqueId) AS TotalBuyTxns,
            (SELECT COUNT(*) FROM tbl_User_Sell_AUG s WHERE s.UniqueId = u.UniqueId) AS TotalSellTxns,
            (SELECT MAX(Ts) FROM tbl_User_Buy_AUG b WHERE b.UniqueId = u.UniqueId) AS LastTxnDate
        FROM tbl_User_AUG u
        WHERE u.KycStatus = 'approved'
    )
    SELECT *, COUNT(*) OVER() AS TotalCount
    FROM UserHoldings
    WHERE
        (@Search IS NULL OR UserName LIKE '%' + @Search + '%'
            OR MobileNumber LIKE '%' + @Search + '%'
            OR UniqueId LIKE '%' + @Search + '%')
        AND (@MetalFilter IS NULL
            OR (@MetalFilter = 'gold-only' AND GoldBalance > 0 AND SilverBalance = 0)
            OR (@MetalFilter = 'silver-only' AND SilverBalance > 0 AND GoldBalance = 0)
            OR (@MetalFilter = 'both' AND GoldBalance > 0 AND SilverBalance > 0))
        AND (@BalanceFilter IS NULL
            OR (@BalanceFilter = 'high' AND TotalValue > 50000)
            OR (@BalanceFilter = 'medium' AND TotalValue BETWEEN 10000 AND 50000)
            OR (@BalanceFilter = 'low' AND TotalValue > 0 AND TotalValue < 10000)
            OR (@BalanceFilter = 'zero' AND TotalValue = 0))
    ORDER BY
        CASE WHEN @SortBy = 'value-high' THEN TotalValue END DESC,
        CASE WHEN @SortBy = 'value-low' THEN TotalValue END ASC,
        CASE WHEN @SortBy = 'gold-high' THEN GoldBalance END DESC,
        CASE WHEN @SortBy = 'silver-high' THEN SilverBalance END DESC,
        CASE WHEN @SortBy = 'recent' THEN LastTxnDate END DESC,
        CASE WHEN @SortBy = 'name' THEN UserName END ASC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

### 5.2 Vault Summary KPIs

```sql
CREATE PROCEDURE report_vault_getsummary
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @GoldRate DECIMAL(12,2), @SilverRate DECIMAL(12,2);
    SELECT TOP 1
        @GoldRate = CAST(JSON_VALUE(JsonOutput, '$.result.data.rates.gBuy') AS DECIMAL(12,2)),
        @SilverRate = CAST(JSON_VALUE(JsonOutput, '$.result.data.rates.sBuy') AS DECIMAL(12,2))
    FROM tbl_Aug_CurrentRate ORDER BY ts DESC;

    SELECT
        ISNULL(SUM(GoldBalance), 0) AS TotalGoldGrams,
        ISNULL(SUM(SilverBalance), 0) AS TotalSilverGrams,
        ISNULL(SUM(GoldBalance), 0) * @GoldRate AS TotalGoldValue,
        ISNULL(SUM(SilverBalance), 0) * @SilverRate AS TotalSilverValue,
        (ISNULL(SUM(GoldBalance), 0) * @GoldRate) + (ISNULL(SUM(SilverBalance), 0) * @SilverRate) AS TotalVaultValue,
        @GoldRate AS CurrentGoldRate,
        @SilverRate AS CurrentSilverRate
    FROM tbl_User_AUG
    WHERE KycStatus = 'approved';
END
GO
```

---

## 6. SIP REPORTS

### 6.1 SIP KPIs

```sql
CREATE PROCEDURE report_sip_getkpis
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT(*) FROM tbl_Gold_SIP) AS TotalSIPs,
        (SELECT COUNT(*) FROM tbl_Gold_SIP WHERE Status = 1) AS ActiveSIPs,
        (SELECT COUNT(*) FROM tbl_Gold_SIP_Payment_Schedule WHERE PaymentStatus = 'Success') AS SuccessPayments,
        (SELECT COUNT(*) FROM tbl_Gold_SIP_Payment_Schedule WHERE PaymentStatus = 'Failed') AS FailedPayments,
        (SELECT COUNT(*) FROM tbl_Gold_SIP_Payment_Schedule WHERE PaymentStatus = 'Pending') AS PendingPayments;
END
GO
```

### 6.2 SIP Plans List

```sql
CREATE PROCEDURE report_sip_getplans
    @Search NVARCHAR(200) = NULL,
    @Frequency NVARCHAR(20) = NULL,
    @MetalType NVARCHAR(10) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        s.Id, s.SIP_Name, s.SIP_Amount, s.SIP_Frequency,
        s.StartDate, s.EndDate, s.Duration, s.Status,
        s.PaymentMode, s.MetalType, s.AugUniqueId,
        u.UserName, u.MobileNumber,
        COUNT(*) OVER() AS TotalCount
    FROM tbl_Gold_SIP s
    LEFT JOIN tbl_User_AUG u ON s.AugUniqueId = u.UniqueId
    WHERE
        (@Search IS NULL OR s.SIP_Name LIKE '%' + @Search + '%'
            OR u.UserName LIKE '%' + @Search + '%')
        AND (@Frequency IS NULL OR s.SIP_Frequency = @Frequency)
        AND (@MetalType IS NULL OR s.MetalType = @MetalType)
    ORDER BY s.Ts DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

### 6.3 SIP Payment Schedules

```sql
CREATE PROCEDURE report_sip_getpaymentschedules
    @SIPID INT = NULL,
    @PaymentStatus NVARCHAR(20) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ps.Id, ps.SIP_ID, ps.ScheduleDate, ps.NotifyDate,
        ps.Amount, ps.Active, ps.PaymentStatus, ps.PaymentId,
        ps.Ts, ps.InstallmentNumber,
        ps.PaymentCapturedTs, ps.GoldBuyStatus, ps.GoldBuyStatusTs,
        s.SIP_Name, s.SIP_Frequency, s.MetalType,
        COUNT(*) OVER() AS TotalCount
    FROM tbl_Gold_SIP_Payment_Schedule ps
    LEFT JOIN tbl_Gold_SIP s ON ps.SIP_ID = s.Id
    WHERE
        (@SIPID IS NULL OR ps.SIP_ID = @SIPID)
        AND (@PaymentStatus IS NULL OR ps.PaymentStatus = @PaymentStatus)
    ORDER BY ps.ScheduleDate DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

### 6.4 SIP Frequency Breakdown

```sql
CREATE PROCEDURE report_sip_getfrequencybreakdown
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Total INT = (SELECT COUNT(*) FROM tbl_Gold_SIP);

    SELECT
        SIP_Frequency AS Frequency,
        COUNT(*) AS SIPCount,
        CAST(COUNT(*) * 100.0 / NULLIF(@Total, 0) AS DECIMAL(5,1)) AS Percentage
    FROM tbl_Gold_SIP
    GROUP BY SIP_Frequency
    ORDER BY COUNT(*) DESC;
END
GO
```

---

## 7. NOMINATION REPORTS

### 7.1 Nomination KPIs

```sql
CREATE PROCEDURE report_nominations_getkpis
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS TotalNominations,
        COUNT(DISTINCT UniqueId) AS UniqueUsers,
        (SELECT TOP 1 NomineeRelation FROM tbl_User_AUG_Nominee GROUP BY NomineeRelation ORDER BY COUNT(*) DESC) AS TopRelation,
        SUM(CASE WHEN Ts >= DATEADD(MONTH, -1, GETDATE()) THEN 1 ELSE 0 END) AS ThisMonth
    FROM tbl_User_AUG_Nominee;
END
GO
```

### 7.2 Nomination List

```sql
CREATE PROCEDURE report_nominations_getlist
    @Search NVARCHAR(200) = NULL,
    @Relation NVARCHAR(50) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        n.Id, n.UniqueId, n.NomineeName, n.NomineeRelation,
        n.NomineeDateOfBirth, n.NomineeMobile, n.NomineeEmail, n.Ts,
        u.UserName AS UserName,
        COUNT(*) OVER() AS TotalCount
    FROM tbl_User_AUG_Nominee n
    LEFT JOIN tbl_User_AUG u ON n.UniqueId = u.UniqueId
    WHERE
        (@Search IS NULL OR n.NomineeName LIKE '%' + @Search + '%'
            OR n.NomineeMobile LIKE '%' + @Search + '%')
        AND (@Relation IS NULL OR n.NomineeRelation = @Relation)
    ORDER BY n.Ts DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

### 7.3 Nomination Relationship Breakdown

```sql
CREATE PROCEDURE report_nominations_getrelationbreakdown
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Total INT = (SELECT COUNT(*) FROM tbl_User_AUG_Nominee);

    SELECT
        NomineeRelation AS Relation,
        COUNT(*) AS NomineeCount,
        CAST(COUNT(*) * 100.0 / NULLIF(@Total, 0) AS DECIMAL(5,1)) AS Percentage
    FROM tbl_User_AUG_Nominee
    GROUP BY NomineeRelation
    ORDER BY COUNT(*) DESC;
END
GO
```

---

## 8. PAYMENT GATEWAY

### 8.1 Payment Gateway KPIs

```sql
CREATE PROCEDURE report_paymentgateway_getkpis
    @FromDate DATE = NULL,
    @ToDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS TotalPayments,
        SUM(CASE WHEN PaymentStatus = 'captured' THEN 1 ELSE 0 END) AS Captured,
        SUM(CASE WHEN PaymentStatus = 'failed' THEN 1 ELSE 0 END) AS Failed,
        SUM(CASE WHEN PaymentStatus IS NULL OR PaymentStatus NOT IN ('captured', 'failed') THEN 1 ELSE 0 END) AS Pending
    FROM tbl_Cashfree_GoldBuyStatus
    WHERE @FromDate IS NULL OR CAST(PaymentStatusTs AS DATE) BETWEEN @FromDate AND ISNULL(@ToDate, GETDATE());
END
GO
```

### 8.2 Payment Gateway List

```sql
CREATE PROCEDURE report_paymentgateway_getlist
    @Search NVARCHAR(200) = NULL,
    @PaymentStatus NVARCHAR(20) = NULL,
    @FromDate DATE = NULL,
    @ToDate DATE = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.ID, p.OrderID, p.txID, p.PaymentStatus,
        p.PaymentStatusTs, p.GoldBuyStatus,
        p.GoldBuyManually, p.GoldBuyManuallyTxID,
        p.GoldBuyManuallyTs, p.IsNotifiedCount,
        COUNT(*) OVER() AS TotalCount
    FROM tbl_Cashfree_GoldBuyStatus p
    WHERE
        (@Search IS NULL OR p.OrderID LIKE '%' + @Search + '%')
        AND (@PaymentStatus IS NULL OR p.PaymentStatus = @PaymentStatus)
        AND (@FromDate IS NULL OR CAST(p.PaymentStatusTs AS DATE) >= @FromDate)
        AND (@ToDate IS NULL OR CAST(p.PaymentStatusTs AS DATE) <= @ToDate)
    ORDER BY p.PaymentStatusTs DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

---

## 9. ORDERS & DELIVERY

### 9.1 Orders KPIs

```sql
CREATE PROCEDURE report_orders_getkpis
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS TotalOrders,
        SUM(CASE WHEN OrderStatus = 'Delivered' THEN 1 ELSE 0 END) AS Delivered,
        SUM(CASE WHEN OrderStatus = 'Shipped' THEN 1 ELSE 0 END) AS Shipped,
        SUM(CASE WHEN OrderStatus = 'Cancelled' THEN 1 ELSE 0 END) AS Cancelled,
        ISNULL(SUM(ShippingCharges), 0) AS TotalShippingCollected
    FROM tbl_Order_Aug;
END
GO
```

### 9.2 Orders List with Product Details

```sql
CREATE PROCEDURE report_orders_getlist
    @Search NVARCHAR(200) = NULL,
    @OrderStatus NVARCHAR(20) = NULL,
    @MetalType NVARCHAR(10) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        o.Id, o.UniqueId, o.OrderId, o.MerchantTransactionId,
        o.ShippingCharges, o.GoldBalance, o.SilverBalance,
        o.OrderStatus, o.CreatedAt, o.UpdatedAt,
        o.PaymentOrderID, o.Quantity, o.Rate,
        o.ProductType, o.ProductDescription, o.MetalType,
        p.ProductType AS ProductSKU, p.ProductDescription AS ProductName,
        p.Grams AS ProductWeight,
        u.UserName, u.MobileNumber,
        COUNT(*) OVER() AS TotalCount
    FROM tbl_Order_Aug o
    LEFT JOIN tbl_Order_AUG_ProductWise p ON o.OrderId = p.OrderId
    LEFT JOIN tbl_User_AUG u ON o.UniqueId = u.UniqueId
    WHERE
        (@Search IS NULL OR o.OrderId LIKE '%' + @Search + '%'
            OR u.UserName LIKE '%' + @Search + '%')
        AND (@OrderStatus IS NULL OR o.OrderStatus = @OrderStatus)
        AND (@MetalType IS NULL OR o.MetalType = @MetalType)
    ORDER BY o.CreatedAt DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

### 9.3 Order Status Funnel

```sql
CREATE PROCEDURE report_orders_getstatusfunnel
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Total INT = (SELECT COUNT(*) FROM tbl_Order_Aug);

    SELECT
        OrderStatus,
        COUNT(*) AS OrderCount,
        CAST(COUNT(*) * 100.0 / NULLIF(@Total, 0) AS DECIMAL(5,1)) AS Percentage
    FROM tbl_Order_Aug
    GROUP BY OrderStatus
    ORDER BY
        CASE OrderStatus
            WHEN 'Generated' THEN 1
            WHEN 'Confirmed' THEN 2
            WHEN 'Shipped' THEN 3
            WHEN 'Delivered' THEN 4
            WHEN 'Cancelled' THEN 5
        END;
END
GO
```

---

## 10. GIFT TRANSACTIONS

### 10.1 Gifts KPIs

```sql
CREATE PROCEDURE report_gifts_getkpis
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS TotalGifts,
        SUM(CASE WHEN IsClaimed = 1 THEN 1 ELSE 0 END) AS Claimed,
        SUM(CASE WHEN IsClaimed = 0 THEN 1 ELSE 0 END) AS Unclaimed,
        ISNULL(SUM(Amount), 0) AS TotalGiftValue
    FROM tbl_Aug_Gift_Peer_To_Peer;
END
GO
```

### 10.2 Gifts List

```sql
CREATE PROCEDURE report_gifts_getlist
    @Search NVARCHAR(200) = NULL,
    @IsClaimed INT = NULL,
    @MetalType NVARCHAR(10) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        g.Id, g.SenderUID, g.ReceiverUID,
        g.SenderUniqueId, g.ReceiverUniqueId,
        g.Amount, g.GiftTemplateId, g.IsClaimed,
        g.PaymentOrderId, g.Tx_Id, g.Ts,
        g.GiftMessage, g.ReceiverMobile, g.ReceiverName,
        g.MetalType, g.IsWeb, g.IsClaimedTs,
        sender.UserName AS SenderName,
        receiver.UserName AS ReceiverName2,
        COUNT(*) OVER() AS TotalCount
    FROM tbl_Aug_Gift_Peer_To_Peer g
    LEFT JOIN tbl_User_AUG sender ON g.SenderUID = sender.UID
    LEFT JOIN tbl_User_AUG receiver ON g.ReceiverUID = receiver.UID
    WHERE
        (@Search IS NULL OR CAST(g.SenderUID AS VARCHAR) LIKE '%' + @Search + '%'
            OR CAST(g.ReceiverUID AS VARCHAR) LIKE '%' + @Search + '%'
            OR g.GiftMessage LIKE '%' + @Search + '%')
        AND (@IsClaimed IS NULL OR g.IsClaimed = @IsClaimed)
        AND (@MetalType IS NULL OR g.MetalType = @MetalType)
    ORDER BY g.Ts DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

---

## 11. RATE ALERTS

### 11.1 Rate Alerts List

```sql
CREATE PROCEDURE report_ratealerts_getlist
    @MetalType NVARCHAR(10) = NULL,
    @NotificationFilter NVARCHAR(20) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        r.RateID, r.MetalType, r.Price, r.Type,
        r.AppNotification, r.EmailNotification,
        r.AugUserID, r.Status, r.CreateDate,
        u.UserName, u.MobileNumber,
        COUNT(*) OVER() AS TotalCount
    FROM tbl_RateAlert r
    LEFT JOIN tbl_User_AUG u ON r.AugUserID = u.UniqueId
    WHERE
        (@MetalType IS NULL OR r.MetalType = @MetalType)
        AND (@NotificationFilter IS NULL
            OR (@NotificationFilter = 'app' AND r.AppNotification = 1)
            OR (@NotificationFilter = 'email' AND r.EmailNotification = 1)
            OR (@NotificationFilter = 'both' AND r.AppNotification = 1 AND r.EmailNotification = 1))
    ORDER BY r.CreateDate DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

### 11.2 Rate Alerts KPIs

```sql
CREATE PROCEDURE report_ratealerts_getkpis
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS TotalAlerts,
        SUM(CASE WHEN MetalType = 'GOLD' THEN 1 ELSE 0 END) AS GoldAlerts,
        SUM(CASE WHEN MetalType = 'SILVER' THEN 1 ELSE 0 END) AS SilverAlerts,
        SUM(CASE WHEN AppNotification = 1 THEN 1 ELSE 0 END) AS AppNotifications,
        SUM(CASE WHEN EmailNotification = 1 THEN 1 ELSE 0 END) AS EmailNotifications
    FROM tbl_RateAlert
    WHERE Status = 1;
END
GO
```

---

## 12. REVENUE & COMMISSION

### 12.1 Revenue Summary

```sql
CREATE PROCEDURE report_revenue_getsummary
    @FromDate DATE = NULL,
    @ToDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @FromDate IS NULL SET @FromDate = DATEADD(YEAR, -1, GETDATE());
    IF @ToDate IS NULL SET @ToDate = GETDATE();

    SELECT
        -- Gold metrics
        (SELECT ISNULL(SUM(TotalAmount), 0) FROM tbl_User_Buy_AUG WHERE MetalType = 'gold' AND CAST(Ts AS DATE) BETWEEN @FromDate AND @ToDate) AS GoldBuyVolume,
        (SELECT ISNULL(SUM(TotalAmount), 0) FROM tbl_User_Sell_AUG WHERE MetalType = 'gold' AND CAST(CreatedAt AS DATE) BETWEEN @FromDate AND @ToDate) AS GoldSellVolume,
        (SELECT ISNULL(SUM(TotalAmount - PreTaxAmount), 0) FROM tbl_User_Buy_AUG WHERE MetalType = 'gold' AND CAST(Ts AS DATE) BETWEEN @FromDate AND @ToDate) AS GoldGSTCollected,

        -- Silver metrics
        (SELECT ISNULL(SUM(TotalAmount), 0) FROM tbl_User_Buy_AUG WHERE MetalType = 'silver' AND CAST(Ts AS DATE) BETWEEN @FromDate AND @ToDate) AS SilverBuyVolume,
        (SELECT ISNULL(SUM(TotalAmount), 0) FROM tbl_User_Sell_AUG WHERE MetalType = 'silver' AND CAST(CreatedAt AS DATE) BETWEEN @FromDate AND @ToDate) AS SilverSellVolume,
        (SELECT ISNULL(SUM(TotalAmount - PreTaxAmount), 0) FROM tbl_User_Buy_AUG WHERE MetalType = 'silver' AND CAST(Ts AS DATE) BETWEEN @FromDate AND @ToDate) AS SilverGSTCollected,

        -- Totals
        (SELECT ISNULL(SUM(TotalAmount), 0) FROM tbl_User_Buy_AUG WHERE CAST(Ts AS DATE) BETWEEN @FromDate AND @ToDate) AS TotalBuyRevenue,
        (SELECT ISNULL(SUM(TotalAmount), 0) FROM tbl_User_Sell_AUG WHERE CAST(CreatedAt AS DATE) BETWEEN @FromDate AND @ToDate) AS TotalSellPayout,
        (SELECT ISNULL(SUM(TotalAmount - PreTaxAmount), 0) FROM tbl_User_Buy_AUG WHERE CAST(Ts AS DATE) BETWEEN @FromDate AND @ToDate) AS TotalGSTCollected;
END
GO
```

### 12.2 Revenue Monthly Trend

```sql
CREATE PROCEDURE report_revenue_getmonthlytrend
    @Year INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Year IS NULL SET @Year = YEAR(GETDATE());

    SELECT
        MONTH(Ts) AS MonthNum,
        DATENAME(MONTH, Ts) AS MonthName,
        ISNULL(SUM(TotalAmount), 0) AS BuyRevenue,
        ISNULL(SUM(TotalAmount - PreTaxAmount), 0) AS GSTCollected
    FROM tbl_User_Buy_AUG
    WHERE YEAR(Ts) = @Year
    GROUP BY MONTH(Ts), DATENAME(MONTH, Ts)
    ORDER BY MONTH(Ts);
END
GO
```

---

## 13. BANK ACCOUNTS

### 13.1 Bank Accounts KPIs

```sql
CREATE PROCEDURE report_bankaccounts_getkpis
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS TotalAccounts,
        SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveAccounts,
        SUM(CASE WHEN Type = 1 THEN 1 ELSE 0 END) AS BankTransfer,
        SUM(CASE WHEN Type = 2 THEN 1 ELSE 0 END) AS UPILinked
    FROM tbl_Gold_Customer_Bank_Account;
END
GO
```

### 13.2 Bank Accounts List

```sql
CREATE PROCEDURE report_bankaccounts_getlist
    @Search NVARCHAR(200) = NULL,
    @Type INT = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        b.Id, b.UID, b.SafeGoldUserId, b.BankAccount,
        b.IfscCode, b.BankName, b.IsActive, b.Ts,
        b.Type, b.UPI_Details, b.AccountName, b.AugUniqueID,
        u.UserName, u.MobileNumber,
        COUNT(*) OVER() AS TotalCount
    FROM tbl_Gold_Customer_Bank_Account b
    LEFT JOIN tbl_User_AUG u ON b.UID = u.UID
    WHERE
        (@Search IS NULL OR b.AccountName LIKE '%' + @Search + '%'
            OR b.BankName LIKE '%' + @Search + '%'
            OR b.IfscCode LIKE '%' + @Search + '%')
        AND (@Type IS NULL OR b.Type = @Type)
    ORDER BY b.Ts DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
```

### 13.3 Top Banks Breakdown

```sql
CREATE PROCEDURE report_bankaccounts_gettopbanks
    @Top INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Total INT = (SELECT COUNT(*) FROM tbl_Gold_Customer_Bank_Account);

    SELECT TOP (@Top)
        BankName,
        COUNT(*) AS AccountCount,
        CAST(COUNT(*) * 100.0 / NULLIF(@Total, 0) AS DECIMAL(5,1)) AS Percentage
    FROM tbl_Gold_Customer_Bank_Account
    GROUP BY BankName
    ORDER BY COUNT(*) DESC;
END
GO
```

---

## 14. GEOGRAPHY

### 14.1 State-wise User Distribution

```sql
CREATE PROCEDURE report_geography_getstatewise
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalUsers INT = (SELECT COUNT(*) FROM tbl_User_AUG);

    SELECT
        ISNULL(u.UserState, 'Unknown') AS State,
        COUNT(*) AS UserCount,
        CAST(COUNT(*) * 100.0 / NULLIF(@TotalUsers, 0) AS DECIMAL(5,1)) AS Percentage,
        ISNULL(SUM(b.BuyVol), 0) AS BuyVolume,
        ISNULL(SUM(s.SellVol), 0) AS SellVolume
    FROM tbl_User_AUG u
    LEFT JOIN (
        SELECT UniqueId, SUM(TotalAmount) AS BuyVol
        FROM tbl_User_Buy_AUG GROUP BY UniqueId
    ) b ON u.UniqueId = b.UniqueId
    LEFT JOIN (
        SELECT UniqueId, SUM(TotalAmount) AS SellVol
        FROM tbl_User_Sell_AUG GROUP BY UniqueId
    ) s ON u.UniqueId = s.UniqueId
    GROUP BY u.UserState
    ORDER BY COUNT(*) DESC;
END
GO
```

---

## 15. SECURITY & SESSIONS

### 15.1 OTP Verification KPIs

```sql
CREATE PROCEDURE report_security_getotkpis
AS
BEGIN
    SET NOCOUNT ON;

    -- Aug OTPs
    SELECT
        'Aug' AS Platform,
        COUNT(*) AS Generated,
        SUM(CASE WHEN IsVerified = 1 THEN 1 ELSE 0 END) AS Verified,
        SUM(CASE WHEN AttemptCount >= MaxAttempts AND IsVerified = 0 THEN 1 ELSE 0 END) AS Failed,
        SUM(CASE WHEN IsExpired = 1 THEN 1 ELSE 0 END) AS Expired
    FROM tbl_UserOTP_Aug

    UNION ALL

    -- GoldLite OTPs
    SELECT
        'GoldLite' AS Platform,
        COUNT(*) AS Generated,
        SUM(CASE WHEN IsVerified = 1 THEN 1 ELSE 0 END) AS Verified,
        SUM(CASE WHEN AttemptCount >= MaxAttempts AND IsVerified = 0 THEN 1 ELSE 0 END) AS Failed,
        SUM(CASE WHEN IsExpired = 1 THEN 1 ELSE 0 END) AS Expired
    FROM tbl_UserOTP_GoldLite;
END
GO
```

### 15.2 Active Sessions

```sql
CREATE PROCEDURE report_security_getactivesessions
    @Top INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@Top)
        Id, UserId, TokenHash, JwtId,
        CreatedAtUtc, ExpiresAtUtc, RevokedAtUtc,
        ReplacedById, UserAgent, IpAddress,
        CASE WHEN ExpiresAtUtc > GETUTCDATE() AND RevokedAtUtc IS NULL THEN 1 ELSE 0 END AS IsActive
    FROM RefreshTokens
    ORDER BY CreatedAtUtc DESC;
END
GO
```

---

## 16. WEB vs MOBILE

### 16.1 Platform Split

```sql
CREATE PROCEDURE report_webmobile_getplatformsplit
    @FromDate DATE = NULL,
    @ToDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Buy transactions
    SELECT 'Buy' AS TransactionType,
        SUM(CASE WHEN IsWeb = 0 THEN 1 ELSE 0 END) AS MobileCount,
        SUM(CASE WHEN IsWeb = 1 THEN 1 ELSE 0 END) AS WebCount,
        SUM(CASE WHEN IsWeb = 0 THEN TotalAmount ELSE 0 END) AS MobileVolume,
        SUM(CASE WHEN IsWeb = 1 THEN TotalAmount ELSE 0 END) AS WebVolume
    FROM tbl_User_Buy_AUG
    WHERE @FromDate IS NULL OR CAST(Ts AS DATE) BETWEEN @FromDate AND ISNULL(@ToDate, GETDATE())

    UNION ALL

    -- Sell transactions
    SELECT 'Sell',
        SUM(CASE WHEN IsWeb = 0 THEN 1 ELSE 0 END),
        SUM(CASE WHEN IsWeb = 1 THEN 1 ELSE 0 END),
        SUM(CASE WHEN IsWeb = 0 THEN TotalAmount ELSE 0 END),
        SUM(CASE WHEN IsWeb = 1 THEN TotalAmount ELSE 0 END)
    FROM tbl_User_Sell_AUG
    WHERE @FromDate IS NULL OR CAST(CreatedAt AS DATE) BETWEEN @FromDate AND ISNULL(@ToDate, GETDATE())

    UNION ALL

    -- Orders
    SELECT 'Order',
        SUM(CASE WHEN IsWeb = 0 THEN 1 ELSE 0 END),
        SUM(CASE WHEN IsWeb = 1 THEN 1 ELSE 0 END),
        SUM(CASE WHEN IsWeb = 0 THEN Rate ELSE 0 END),
        SUM(CASE WHEN IsWeb = 1 THEN Rate ELSE 0 END)
    FROM tbl_Order_Aug
    WHERE @FromDate IS NULL OR CAST(CreatedAt AS DATE) BETWEEN @FromDate AND ISNULL(@ToDate, GETDATE());
END
GO
```

---

## 17. ANALYTICS (Aggregated)

### 17.1 Monthly User Growth

```sql
CREATE PROCEDURE report_analytics_getusergrowth
    @Year INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Year IS NULL SET @Year = YEAR(GETDATE());

    SELECT
        MONTH(CreatedAt) AS MonthNum,
        DATENAME(MONTH, CreatedAt) AS MonthName,
        COUNT(*) AS NewUsers,
        SUM(COUNT(*)) OVER (ORDER BY MONTH(CreatedAt)) AS CumulativeUsers
    FROM tbl_User_AUG
    WHERE YEAR(CreatedAt) = @Year
    GROUP BY MONTH(CreatedAt), DATENAME(MONTH, CreatedAt)
    ORDER BY MONTH(CreatedAt);
END
GO
```

### 17.2 Metal-wise Volume Trend

```sql
CREATE PROCEDURE report_analytics_getmetaltrend
    @Year INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @Year IS NULL SET @Year = YEAR(GETDATE());

    SELECT
        MONTH(Ts) AS MonthNum,
        DATENAME(MONTH, Ts) AS MonthName,
        SUM(CASE WHEN MetalType = 'gold' THEN TotalAmount ELSE 0 END) AS GoldVolume,
        SUM(CASE WHEN MetalType = 'silver' THEN TotalAmount ELSE 0 END) AS SilverVolume,
        COUNT(CASE WHEN MetalType = 'gold' THEN 1 END) AS GoldTxns,
        COUNT(CASE WHEN MetalType = 'silver' THEN 1 END) AS SilverTxns
    FROM tbl_User_Buy_AUG
    WHERE YEAR(Ts) = @Year
    GROUP BY MONTH(Ts), DATENAME(MONTH, Ts)
    ORDER BY MONTH(Ts);
END
GO
```

---

## SUMMARY

| # | Section | Stored Procedures | Count |
|---|---------|-------------------|-------|
| 1 | Dashboard | `report_dashboard_getkpis`, `report_dashboard_getliverates`, `report_dashboard_gettransactiontrend`, `report_dashboard_getrecentactivity` | 4 |
| 2 | Users | `report_users_getkpis`, `report_users_getlist`, `report_users_getstates` | 3 |
| 3 | Transactions | `report_transactions_getbuylist`, `report_transactions_getselllist`, `report_transactions_getkpis` | 3 |
| 4 | Goals | `report_goals_getlist`, `report_goals_getkpis`, `report_goals_gettypebreakdown` | 3 |
| 5 | Vault | `report_vault_getcustomerholdings`, `report_vault_getsummary` | 2 |
| 6 | SIP | `report_sip_getkpis`, `report_sip_getplans`, `report_sip_getpaymentschedules`, `report_sip_getfrequencybreakdown` | 4 |
| 7 | Nominations | `report_nominations_getkpis`, `report_nominations_getlist`, `report_nominations_getrelationbreakdown` | 3 |
| 8 | Payment Gateway | `report_paymentgateway_getkpis`, `report_paymentgateway_getlist` | 2 |
| 9 | Orders | `report_orders_getkpis`, `report_orders_getlist`, `report_orders_getstatusfunnel` | 3 |
| 10 | Gifts | `report_gifts_getkpis`, `report_gifts_getlist` | 2 |
| 11 | Rate Alerts | `report_ratealerts_getlist`, `report_ratealerts_getkpis` | 2 |
| 12 | Revenue | `report_revenue_getsummary`, `report_revenue_getmonthlytrend` | 2 |
| 13 | Bank Accounts | `report_bankaccounts_getkpis`, `report_bankaccounts_getlist`, `report_bankaccounts_gettopbanks` | 3 |
| 14 | Geography | `report_geography_getstatewise` | 1 |
| 15 | Security | `report_security_getotkpis`, `report_security_getactivesessions` | 2 |
| 16 | Web vs Mobile | `report_webmobile_getplatformsplit` | 1 |
| 17 | Analytics | `report_analytics_getusergrowth`, `report_analytics_getmetaltrend` | 2 |
| | **TOTAL** | | **42** |
